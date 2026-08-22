import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeSeoScore } from "@/lib/seo/score";

// GET /api/report?companyId=xxx — generates a branded HTML SEO report (print to PDF)
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  const company = await db.company.findUnique({
    where: { id: companyId },
    include: { domain: true, client: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const [latest, first, keywords, issues, backlinks, competitors] = await Promise.all([
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "desc" } }),
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "asc" } }),
    db.keyword.findMany({ where: { companyId }, orderBy: { position: "asc" }, take: 10 }),
    db.technicalIssue.findMany({ where: { companyId, status: "open" } }),
    db.backlink.findMany({ where: { companyId }, orderBy: { domainAuthority: "desc" }, take: 10 }),
    db.competitor.findMany({ where: { companyId } }),
  ]);

  const seoScore = computeSeoScore({ latest, issues, keywords, backlinks });
  const trafficDelta =
    latest && first && first.organicTraffic > 0
      ? ((latest.organicTraffic - first.organicTraffic) / first.organicTraffic) * 100
      : 0;

  const grade =
    seoScore.total >= 85 ? "A+" : seoScore.total >= 75 ? "A" : seoScore.total >= 65 ? "B" : seoScore.total >= 50 ? "C" : seoScore.total >= 35 ? "D" : "F";

  const clientName = company.client?.name ?? "—";
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SEO Report — ${company.name}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a2e1a; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 3px solid #10b981; margin-bottom: 24px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #14b8a6); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
  .brand-name { font-size: 20px; font-weight: 700; }
  .brand-sub { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .meta { text-align: right; font-size: 12px; color: #64748b; }
  .hero { background: linear-gradient(135deg, #ecfdf5, #f0fdfa); border-radius: 16px; padding: 28px; margin-bottom: 24px; display: flex; align-items: center; gap: 32px; }
  .score-ring { width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(#10b981 ${seoScore.total * 3.6}deg, #e2e8f0 0); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .score-inner { width: 96px; height: 96px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-size: 36px; font-weight: 800; color: #10b981; }
  .score-grade { font-size: 12px; font-weight: 600; color: #10b981; }
  .hero-info h1 { font-size: 26px; margin-bottom: 6px; }
  .hero-info p { color: #64748b; font-size: 14px; margin-bottom: 4px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .kpi { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
  .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
  .kpi-delta { font-size: 11px; margin-top: 2px; }
  .pos { color: #10b981; } .neg { color: #ef4444; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px 10px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
  td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
  .b-green { background: #d1fae5; color: #065f46; } .b-amber { background: #fef3c7; color: #92400e; } .b-rose { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
  @media print { .no-print { display: none; } }
  .print-btn { position: fixed; top: 16px; right: 16px; padding: 10px 18px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
</style></head>
<body>
<button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
<div class="header">
  <div class="brand">
    <div class="logo">RF</div>
    <div>
      <div class="brand-name">RankForge SEO</div>
      <div class="brand-sub">Client Report</div>
    </div>
  </div>
  <div class="meta">
    <div><strong>${reportDate}</strong></div>
    <div>Prepared for: ${clientName}</div>
    <div>${company.website}</div>
  </div>
</div>

<div class="hero">
  <div class="score-ring"><div class="score-inner"><div class="score-num">${seoScore.total}</div><div class="score-grade">Grade ${grade}</div></div></div>
  <div class="hero-info">
    <h1>${company.name}</h1>
    <p>${company.description}</p>
    <p>Industry: ${company.industry} · Domain: ${company.domain.name}</p>
  </div>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> Key Performance Indicators</div>
  <div class="kpis">
    <div class="kpi"><div class="kpi-label">Organic Traffic</div><div class="kpi-value">${(latest?.organicTraffic ?? 0).toLocaleString()}</div><div class="kpi-delta ${trafficDelta >= 0 ? 'pos' : 'neg'}">${trafficDelta >= 0 ? '+' : ''}${trafficDelta.toFixed(1)}% (30d)</div></div>
    <div class="kpi"><div class="kpi-label">Keywords Ranked</div><div class="kpi-value">${(latest?.keywordsRanked ?? 0).toLocaleString()}</div><div class="kpi-delta">${keywords.length} tracked</div></div>
    <div class="kpi"><div class="kpi-label">Avg Position</div><div class="kpi-value">#${(latest?.avgPosition ?? 0).toFixed(1)}</div><div class="kpi-delta">Visibility ${(latest?.visibilityScore ?? 0).toFixed(0)}%</div></div>
    <div class="kpi"><div class="kpi-label">Domain Authority</div><div class="kpi-value">${(latest?.domainAuthority ?? 0).toFixed(1)}</div><div class="kpi-delta">PA ${(latest?.pageAuthority ?? 0).toFixed(0)}</div></div>
    <div class="kpi"><div class="kpi-label">Backlinks</div><div class="kpi-value">${(latest?.backlinks ?? 0).toLocaleString()}</div><div class="kpi-delta">${backlinks.length} analyzed</div></div>
    <div class="kpi"><div class="kpi-label">Open Issues</div><div class="kpi-value">${issues.filter(i => i.status === 'open').length}</div><div class="kpi-delta">${issues.filter(i => i.severity === 'critical').length} critical</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> Top 10 Keywords</div>
  <table><thead><tr><th>Keyword</th><th>Position</th><th>Volume</th><th>Difficulty</th><th>Intent</th></tr></thead><tbody>
    ${keywords.map(k => `<tr><td>${k.keyword}</td><td><span class="badge ${k.position <= 3 ? 'b-green' : k.position <= 10 ? 'b-amber' : 'b-rose'}">#${k.position}</span></td><td>${k.searchVolume.toLocaleString()}</td><td>${k.difficulty.toFixed(0)}/100</td><td>${k.intent}</td></tr>`).join("")}
  </tbody></table>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> Score Breakdown</div>
  <table><thead><tr><th>Component</th><th>Score</th><th>Weight</th></tr></thead><tbody>
    ${seoScore.breakdown.map(b => `<tr><td>${b.label}</td><td><strong>${b.score}/100</strong></td><td>${Math.round(b.weight * 100)}%</td></tr>`).join("")}
  </tbody></table>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> Technical Issues Summary</div>
  <table><thead><tr><th>Severity</th><th>Count</th></tr></thead><tbody>
    <tr><td><span class="badge b-rose">Critical</span></td><td>${issues.filter(i => i.severity === 'critical').length}</td></tr>
    <tr><td><span class="badge b-amber">Warning</span></td><td>${issues.filter(i => i.severity === 'warning').length}</td></tr>
    <tr><td><span class="badge b-green">Info</span></td><td>${issues.filter(i => i.severity === 'info').length}</td></tr>
  </tbody></table>
</div>

<div class="footer">
  Generated by RankForge SEO · ${reportDate} · Confidential report for ${company.name}
</div>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
