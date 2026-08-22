import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeSeoScore } from "@/lib/seo/score";

// GET /api/companies/[id] — full SEO profile for a company
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    include: { domain: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const [
    metrics,
    keywords,
    backlinks,
    competitors,
    issues,
    contentGaps,
    insights,
    latest,
    first,
  ] = await Promise.all([
    db.seoMetric.findMany({
      where: { companyId: id },
      orderBy: { date: "asc" },
    }),
    db.keyword.findMany({
      where: { companyId: id },
      orderBy: { position: "asc" },
    }),
    db.backlink.findMany({
      where: { companyId: id },
      orderBy: { domainAuthority: "desc" },
    }),
    db.competitor.findMany({
      where: { companyId: id },
      orderBy: { organicTraffic: "desc" },
    }),
    db.technicalIssue.findMany({
      where: { companyId: id },
      orderBy: [{ status: "asc" }, { detectedAt: "desc" }],
    }),
    db.contentGap.findMany({
      where: { companyId: id },
      orderBy: { opportunity: "desc" },
    }),
    db.seoInsight.findMany({
      where: { companyId: id },
      orderBy: { createdAt: "desc" },
    }),
    db.seoMetric.findFirst({
      where: { companyId: id },
      orderBy: { date: "desc" },
    }),
    db.seoMetric.findFirst({
      where: { companyId: id },
      orderBy: { date: "asc" },
    }),
  ]);

  // Position distribution buckets (1-3, 4-10, 11-20, 21-50, 51-100)
  const buckets = [0, 0, 0, 0, 0];
  for (const k of keywords) {
    if (k.position <= 3) buckets[0]++;
    else if (k.position <= 10) buckets[1]++;
    else if (k.position <= 20) buckets[2]++;
    else if (k.position <= 50) buckets[3]++;
    else buckets[4]++;
  }

  // Traffic delta
  const trafficDelta =
    latest && first && first.organicTraffic > 0
      ? ((latest.organicTraffic - first.organicTraffic) / first.organicTraffic) * 100
      : 0;

  // Backlink type distribution
  const dofollow = backlinks.filter((b) => b.linkType === "dofollow").length;
  const nofollow = backlinks.length - dofollow;
  const newLinks = backlinks.filter((b) => b.status === "new").length;
  const lostLinks = backlinks.filter((b) => b.status === "lost").length;
  const activeLinks = backlinks.filter((b) => b.status === "active").length;

  // Issue severity counts
  const issueStats = {
    critical: issues.filter((i) => i.severity === "critical" && i.status === "open").length,
    warning: issues.filter((i) => i.severity === "warning" && i.status === "open").length,
    info: issues.filter((i) => i.severity === "info" && i.status === "open").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  const seoScore = computeSeoScore({
    latest,
    issues,
    keywords,
    backlinks,
  });

  return NextResponse.json({
    company,
    domain: company.domain,
    metrics,
    keywords,
    backlinks,
    competitors,
    issues,
    contentGaps,
    insights,
    latest,
    seoScore,
    trafficDelta: Math.round(trafficDelta * 10) / 10,
    positionBuckets: buckets,
    backlinkStats: { dofollow, nofollow, newLinks, lostLinks, activeLinks, total: backlinks.length },
    issueStats,
  });
}
