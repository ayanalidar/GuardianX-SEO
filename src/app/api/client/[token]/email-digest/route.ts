import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/email-digest — generates a branded HTML email with traffic, ROI,
// next week's priorities, and competitor alerts.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({
    where: { token },
    include: { company: { include: { domain: true } } },
  });
  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const companyId = client.companyId;
  const [latest, first, issues, competitors, alerts, insights, contentGaps] = await Promise.all([
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "desc" } }),
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "asc" } }),
    db.technicalIssue.findMany({ where: { companyId, status: "open" }, orderBy: [{ severity: "asc" }, { detectedAt: "desc" }], take: 5 }),
    db.competitor.findMany({ where: { companyId }, orderBy: { organicTraffic: "desc" }, take: 3 }),
    db.competitorAlert.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.seoInsight.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 3 }),
    db.contentGap.findMany({ where: { companyId }, orderBy: { opportunity: "desc" }, take: 4 }),
  ]);

  const traffic = latest?.organicTraffic ?? 0;
  const prevTraffic = first?.organicTraffic ?? traffic;
  const trafficDeltaPct = prevTraffic > 0 ? ((traffic - prevTraffic) / prevTraffic) * 100 : 0;
  const keywordsRanked = latest?.keywordsRanked ?? 0;
  const avgPosition = latest?.avgPosition ?? 0;
  const da = latest?.domainAuthority ?? 0;

  // ROI calc (default CR=2.5%, AOV=$85)
  const monthlyConversions = Math.round((traffic * 2.5) / 100);
  const monthlyRevenue = Math.round(monthlyConversions * 85);

  // Next week priorities (top 5 issues + top 3 content gaps)
  const priorities: Array<{ title: string; description: string; severity: string }> = [];
  issues.slice(0, 5).forEach((i) => {
    priorities.push({
      title: `Fix: ${i.title}`,
      description: i.description,
      severity: i.severity,
    });
  });
  contentGaps.slice(0, 3).forEach((g) => {
    priorities.push({
      title: `Publish article for "${g.keyword}"`,
      description: `Vol ${g.searchVolume}/mo, opportunity ${Math.round(g.opportunity)}/100`,
      severity: g.opportunity > 70 ? "high" : "medium",
    });
  });

  const subject = `${client.company.name} — Weekly SEO Digest`;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f6f8;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 6px rgba(15,23,42,0.05);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0ea5a4,#10b981);padding:32px 40px;">
          <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">GuardianX SEO</div>
          <div style="font-size:13px;color:#d1fae5;margin-top:4px;">Weekly Digest · ${dateStr}</div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:32px 40px 8px 40px;">
          <div style="font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;">Hi ${escapeHtml(client.name)},</div>
          <div style="font-size:15px;color:#475569;line-height:1.6;margin-top:8px;">
            Here's your weekly SEO snapshot for <strong style="color:#0f172a;">${escapeHtml(client.company.name)}</strong>.
            Traffic ${trafficDeltaPct >= 0 ? "is up" : "is down"} ${Math.abs(trafficDeltaPct).toFixed(1)}% vs. the start of the tracked period.
          </div>
        </td></tr>

        <!-- KPIs -->
        <tr><td style="padding:20px 40px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
            <tr>
              ${kpiCell("Organic Traffic", traffic.toLocaleString(), trafficDeltaPct >= 0 ? "#10b981" : "#ef4444", `${trafficDeltaPct >= 0 ? "+" : ""}${trafficDeltaPct.toFixed(1)}%`)}
              ${kpiCell("Keywords Ranked", keywordsRanked.toString(), "#0ea5a4", "Top 100")}
              ${kpiCell("Avg Position", avgPosition.toFixed(1), "#6366f1", "across all kw")}
              ${kpiCell("Domain Authority", da.toFixed(0), "#f59e0b", "0–100")}
            </tr>
          </table>
        </td></tr>

        <!-- ROI -->
        <tr><td style="padding:8px 40px 24px 40px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#10b98110,#0ea5a410);border-radius:12px;border:1px solid #a7f3d0;">
            <tr><td style="padding:20px 24px;">
              <div style="font-size:13px;font-weight:600;color:#047857;text-transform:uppercase;letter-spacing:0.5px;">Est. Monthly Revenue</div>
              <div style="font-size:30px;font-weight:700;color:#0f172a;letter-spacing:-1px;margin-top:6px;">$${monthlyRevenue.toLocaleString()}</div>
              <div style="font-size:13px;color:#475569;margin-top:6px;">${monthlyConversions.toLocaleString()} conversions · 2.5% CR · $85 AOV · ad-cost equivalent $${(traffic * 1.5).toFixed(0)}</div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Priorities -->
        <tr><td style="padding:8px 40px 24px 40px;">
          <div style="font-size:17px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Next Week's Priorities</div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;">
            ${priorities.slice(0, 6).map((p, i) => `
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="32" valign="top" style="padding-right:12px;">
                    <div style="width:24px;height:24px;border-radius:50%;background:${severityColor(p.severity)};color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">${i + 1}</div>
                  </td>
                  <td valign="top">
                    <div style="font-size:14px;font-weight:600;color:#0f172a;">${escapeHtml(p.title)}</div>
                    <div style="font-size:13px;color:#64748b;line-height:1.5;margin-top:2px;">${escapeHtml(p.description)}</div>
                  </td>
                </tr>
              </table>
            </td></tr>`).join("")}
          </table>
        </td></tr>

        ${alerts.length > 0 ? `
        <!-- Competitor Alerts -->
        <tr><td style="padding:8px 40px 24px 40px;">
          <div style="font-size:17px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Competitor Alerts</div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
            ${alerts.slice(0, 4).map(a => `
            <tr><td style="padding:12px 16px;border-bottom:1px solid #fee2e2;">
              <div style="font-size:13px;font-weight:600;color:#b91c1c;">${escapeHtml(a.title)}</div>
              <div style="font-size:12px;color:#7f1d1d;margin-top:2px;">${escapeHtml(a.description)}</div>
            </td></tr>`).join("")}
          </table>
        </td></tr>` : ""}

        <!-- Insights -->
        ${insights.length > 0 ? `
        <tr><td style="padding:8px 40px 24px 40px;">
          <div style="font-size:17px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">AI Insights</div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;">
            ${insights.slice(0, 3).map(i => `
            <tr><td style="padding:12px 16px;background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;margin-bottom:8px;">
              <div style="font-size:14px;font-weight:600;color:#1e3a8a;">${escapeHtml(i.title)}</div>
              <div style="font-size:13px;color:#1e40af;line-height:1.5;margin-top:4px;">${escapeHtml(i.content.slice(0, 240))}${i.content.length > 240 ? "…" : ""}</div>
            </td></tr>
            <tr><td height="8"></td></tr>`).join("")}
          </table>
        </td></tr>` : ""}

        <!-- CTA -->
        <tr><td style="padding:16px 40px 32px 40px;">
          <a href="${client.company.website ? client.company.website : "#"}" style="display:inline-block;background:#10b981;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">View Full Portal →</a>
          <div style="font-size:12px;color:#94a3b8;margin-top:16px;line-height:1.5;">
            You're receiving this because you're onboarded on GuardianX SEO for ${escapeHtml(client.company.name)}.
            Reply to this email to opt out.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return NextResponse.json({
    subject,
    html,
    preview: `Weekly SEO digest — traffic ${trafficDeltaPct >= 0 ? "+" : ""}${trafficDeltaPct.toFixed(1)}%, est. revenue $${monthlyRevenue.toLocaleString()}/mo`,
    data: {
      client: client.name,
      company: client.company.name,
      website: client.company.website,
      traffic,
      trafficDeltaPct: Math.round(trafficDeltaPct * 10) / 10,
      keywordsRanked,
      avgPosition,
      domainAuthority: da,
      monthlyConversions,
      monthlyRevenue,
      adCostEquivalent: Math.round(traffic * 1.5),
      priorities,
      alerts: alerts.slice(0, 5).map((a) => ({ title: a.title, description: a.description, severity: a.severity })),
      insights: insights.slice(0, 3).map((i) => ({ title: i.title, content: i.content.slice(0, 240) })),
      generatedAt: new Date().toISOString(),
    },
  });
}

function kpiCell(label: string, value: string, color: string, sub: string): string {
  return `<td width="25%" style="padding:16px 12px;text-align:center;border-right:1px solid #e2e8f0;">
    <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
    <div style="font-size:20px;font-weight:700;color:${color};margin-top:4px;letter-spacing:-0.5px;">${value}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${sub}</div>
  </td>`;
}

function severityColor(sev: string): string {
  if (sev === "critical" || sev === "high") return "#ef4444";
  if (sev === "warning" || sev === "medium") return "#f59e0b";
  return "#6366f1";
}

function escapeHtml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
