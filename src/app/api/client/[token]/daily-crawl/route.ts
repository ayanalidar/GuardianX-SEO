import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/daily-crawl — automated crawl that detects NEW issues
// (compares against existing), creates alerts, marks resolved issues.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({
    where: { token },
    include: { company: true },
  });
  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const companyId = client.companyId;
  let baseUrl = (client.company.website || "").trim();
  if (baseUrl && !baseUrl.startsWith("http")) baseUrl = "https://" + baseUrl;
  if (!baseUrl) {
    return NextResponse.json({ error: "No website configured for this client" }, { status: 400 });
  }

  // Snapshot existing open issues
  const existing = await db.technicalIssue.findMany({
    where: { companyId, status: "open" },
    orderBy: { detectedAt: "desc" },
  });
  const existingTitles = new Set(existing.map((i) => i.title));

  // Fetch homepage + measure response time
  let html = "";
  let loadMs = 0;
  let fetchStatus = 0;
  try {
    const t0 = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(baseUrl, {
      headers: { "User-Agent": "GuardianX-SEO-DailyBot/1.0" },
      signal: controller.signal,
      redirect: "follow",
    });
    html = await res.text();
    fetchStatus = res.status;
    loadMs = Date.now() - t0;
    clearTimeout(timeout);
  } catch (err) {
    return NextResponse.json({
      error: "Daily crawl failed — could not reach site",
      url: baseUrl,
      message: err instanceof Error ? err.message : String(err),
    }, { status: 502 });
  }

  // Detect issues on the live page
  const detected: Array<{ type: string; severity: "critical" | "warning" | "info"; title: string; description: string }> = [];

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  if (!title) {
    detected.push({ type: "title", severity: "critical", title: "Missing <title> tag", description: "Homepage has no title element." });
  } else if (title.length > 65) {
    detected.push({ type: "title", severity: "warning", title: "Title too long", description: `Title is ${title.length} chars (max 65).` });
  }

  const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  if (!metaMatch) {
    detected.push({ type: "meta", severity: "critical", title: "Missing meta description", description: "Homepage has no meta description." });
  }

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count === 0) {
    detected.push({ type: "h1", severity: "critical", title: "Missing H1", description: "Homepage has no H1." });
  } else if (h1Count > 1) {
    detected.push({ type: "h1", severity: "warning", title: "Multiple H1 tags", description: `${h1Count} H1 tags on homepage.` });
  }

  const imgsNoAlt = (html.match(/<img(?![^>]*\salt=)[^>]*>/gi) || []).length;
  if (imgsNoAlt > 0) {
    detected.push({ type: "images", severity: imgsNoAlt > 5 ? "critical" : "warning", title: `${imgsNoAlt} images missing alt`, description: "Accessibility + SEO impact." });
  }

  const schemaCount = (html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/gi) || []).length;
  if (schemaCount === 0) {
    detected.push({ type: "schema", severity: "warning", title: "No JSON-LD schema", description: "No structured data on homepage." });
  }

  const viewportMatch = html.match(/<meta[^>]+name=["']viewport["']/i);
  if (!viewportMatch) {
    detected.push({ type: "mobile", severity: "critical", title: "Missing viewport meta", description: "Mobile rendering will break." });
  }

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["']/i);
  if (!canonicalMatch) {
    detected.push({ type: "canonical", severity: "warning", title: "Missing canonical link", description: "No canonical URL specified." });
  }

  if (loadMs > 3000) {
    detected.push({ type: "performance", severity: "warning", title: "Slow homepage", description: `Load time ${loadMs}ms exceeds 3s threshold.` });
  }

  const httpsOk = baseUrl.startsWith("https://");
  if (!httpsOk) {
    detected.push({ type: "security", severity: "critical", title: "Not using HTTPS", description: "Site URL is not HTTPS." });
  }

  // Identify NEW issues (not in existing open set) and RESOLVED issues (in existing, not detected)
  const newIssues = detected.filter((d) => !existingTitles.has(d.title));
  const detectedTitles = new Set(detected.map((d) => d.title));
  const resolvedIssues = existing.filter((i) => !detectedTitles.has(i.title));

  // Persist new issues
  const created = await Promise.all(
    newIssues.map((d) =>
      db.technicalIssue.create({
        data: {
          companyId,
          type: d.type,
          severity: d.severity,
          title: d.title,
          description: d.description,
          affectedCount: 1,
          status: "open",
          detectedAt: new Date(),
        },
      })
    )
  );

  // Mark resolved issues
  const resolved = await Promise.all(
    resolvedIssues.map((i) =>
      db.technicalIssue.update({
        where: { id: i.id },
        data: { status: "resolved" },
      })
    )
  );

  // Create competitor-style alert rows for the daily crawl summary
  const alerts = await Promise.all(
    newIssues.slice(0, 5).map((n) =>
      db.competitorAlert.create({
        data: {
          companyId,
          type: "feature-lost",
          severity: n.severity,
          title: `Daily crawl: ${n.title}`,
          description: n.description,
          competitor: client.company.name,
          metric: n.type,
          value: "new-issue",
          read: false,
        },
      })
    )
  );

  return NextResponse.json({
    crawledAt: new Date().toISOString(),
    baseUrl,
    httpStatus: fetchStatus,
    loadMs,
    summary: {
      newIssues: newIssues.length,
      resolvedIssues: resolvedIssues.length,
      unchangedIssues: existing.length - resolvedIssues.length,
      totalOpenAfter: existing.length - resolvedIssues.length + newIssues.length,
    },
    newIssues: created.map((c) => ({ id: c.id, type: c.type, severity: c.severity, title: c.title, description: c.description, detectedAt: c.detectedAt })),
    resolvedIssues: resolved.map((r) => ({ id: r.id, type: r.type, title: r.title, status: r.status })),
    alerts: alerts.map((a) => ({ id: a.id, title: a.title, severity: a.severity })),
    detectedLive: detected,
  });
}
