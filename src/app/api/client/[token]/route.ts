import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeSeoScore } from "@/lib/seo/score";

// GET /api/client/[token] — full client portal data
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const client = await db.client.findUnique({
    where: { token },
    include: {
      company: { include: { domain: true } },
      goals: { orderBy: { createdAt: "asc" } },
      tasks: { orderBy: [{ status: "asc" }, { createdAt: "desc" }] },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Invalid portal link" }, { status: 404 });
  }

  const companyId = client.companyId;

  const [
    metrics,
    keywords,
    backlinks,
    competitors,
    issues,
    contentGaps,
    insights,
    webVitals,
    serpFeatures,
    latest,
    first,
  ] = await Promise.all([
    db.seoMetric.findMany({ where: { companyId }, orderBy: { date: "asc" } }),
    db.keyword.findMany({ where: { companyId }, orderBy: { position: "asc" } }),
    db.backlink.findMany({ where: { companyId }, orderBy: { domainAuthority: "desc" } }),
    db.competitor.findMany({ where: { companyId }, orderBy: { organicTraffic: "desc" } }),
    db.technicalIssue.findMany({ where: { companyId }, orderBy: [{ status: "asc" }, { detectedAt: "desc" }] }),
    db.contentGap.findMany({ where: { companyId }, orderBy: { opportunity: "desc" } }),
    db.seoInsight.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } }),
    db.coreWebVital.findMany({ where: { companyId }, orderBy: [{ device: "asc" }, { score: "asc" }] }),
    db.serpFeature.findMany({ where: { companyId }, orderBy: [{ captured: "desc" }, { updatedAt: "desc" }] }),
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "desc" } }),
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "asc" } }),
  ]);

  // Update lastVisit
  await db.client.update({
    where: { id: client.id },
    data: { lastVisit: new Date() },
  });

  // Compute aggregates (mirror of company detail)
  const buckets = [0, 0, 0, 0, 0];
  for (const k of keywords) {
    if (k.position <= 3) buckets[0]++;
    else if (k.position <= 10) buckets[1]++;
    else if (k.position <= 20) buckets[2]++;
    else if (k.position <= 50) buckets[3]++;
    else buckets[4]++;
  }

  const trafficDelta =
    latest && first && first.organicTraffic > 0
      ? ((latest.organicTraffic - first.organicTraffic) / first.organicTraffic) * 100
      : 0;

  const dofollow = backlinks.filter((b) => b.linkType === "dofollow").length;
  const issueStats = {
    critical: issues.filter((i) => i.severity === "critical" && i.status === "open").length,
    warning: issues.filter((i) => i.severity === "warning" && i.status === "open").length,
    info: issues.filter((i) => i.severity === "info" && i.status === "open").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  const mobileWv = webVitals.filter((w) => w.device === "mobile");
  const desktopWv = webVitals.filter((w) => w.device === "desktop");
  const cwvSummary = {
    avgScore: webVitals.length > 0 ? Math.round((webVitals.reduce((s, w) => s + w.score, 0) / webVitals.length) * 10) / 10 : 0,
    good: webVitals.filter((w) => w.status === "good").length,
    needsImprovement: webVitals.filter((w) => w.status === "needs-improvement").length,
    poor: webVitals.filter((w) => w.status === "poor").length,
    mobileScore: mobileWv.length > 0 ? Math.round((mobileWv.reduce((s, w) => s + w.score, 0) / mobileWv.length) * 10) / 10 : 0,
    desktopScore: desktopWv.length > 0 ? Math.round((desktopWv.reduce((s, w) => s + w.score, 0) / desktopWv.length) * 10) / 10 : 0,
  };

  const byType: Record<string, { captured: number; competitorOwned: number }> = {};
  for (const f of serpFeatures) {
    if (!byType[f.type]) byType[f.type] = { captured: 0, competitorOwned: 0 };
    if (f.captured) byType[f.type].captured++;
    if (f.competitorOwned) byType[f.type].competitorOwned++;
  }
  const serpSummary = {
    captured: serpFeatures.filter((f) => f.captured).length,
    competitorOwned: serpFeatures.filter((f) => f.competitorOwned).length,
    byType,
  };

  const seoScore = computeSeoScore({ latest, issues, keywords, backlinks });

  // Update goal progress from latest metrics
  const updatedGoals = client.goals.map((g) => {
    let current = g.current;
    if (latest) {
      if (g.type === "traffic") current = latest.organicTraffic;
      else if (g.type === "keywords") current = latest.keywordsRanked;
      else if (g.type === "authority") current = latest.domainAuthority;
      else if (g.type === "position") current = latest.avgPosition;
      else if (g.type === "visibility") current = latest.visibilityScore;
      else if (g.type === "backlinks") current = latest.backlinks;
    }
    const progress =
      g.type === "position"
        ? g.target > 0
          ? Math.min(100, Math.max(0, ((current - 100) / (g.target - 100)) * 100))
          : 0
        : g.target > 0
        ? Math.min(100, (current / g.target) * 100)
        : 0;
    return { ...g, current, progress: Math.round(progress * 10) / 10 };
  });

  return NextResponse.json({
    client,
    company: client.company,
    domain: client.company.domain,
    metrics,
    keywords,
    backlinks,
    competitors,
    issues,
    contentGaps,
    insights,
    webVitals,
    serpFeatures,
    latest,
    seoScore,
    trafficDelta: Math.round(trafficDelta * 10) / 10,
    positionBuckets: buckets,
    backlinkStats: {
      dofollow,
      nofollow: backlinks.length - dofollow,
      newLinks: backlinks.filter((b) => b.status === "new").length,
      lostLinks: backlinks.filter((b) => b.status === "lost").length,
      activeLinks: backlinks.filter((b) => b.status === "active").length,
      total: backlinks.length,
    },
    issueStats,
    cwvSummary,
    serpSummary,
    goals: updatedGoals,
    tasks: client.tasks,
  });
}
