import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeSeoScore } from "@/lib/seo/score";

// GET /api/compare?ids=id1,id2,id3 — compare up to 4 companies side-by-side
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (ids.length < 2) {
    return NextResponse.json(
      { error: "Provide at least 2 company ids via ?ids=a,b" },
      { status: 400 }
    );
  }

  const companies = await db.company.findMany({
    where: { id: { in: ids } },
    include: { domain: true },
  });

  // Preserve requested order
  const ordered = ids
    .map((id) => companies.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const results = await Promise.all(
    ordered.map(async (c) => {
      const [latest, first, kwCount, blCount, issueCount, topKeywords, metrics] =
        await Promise.all([
          db.seoMetric.findFirst({
            where: { companyId: c.id },
            orderBy: { date: "desc" },
          }),
          db.seoMetric.findFirst({
            where: { companyId: c.id },
            orderBy: { date: "asc" },
          }),
          db.keyword.count({ where: { companyId: c.id } }),
          db.backlink.count({ where: { companyId: c.id } }),
          db.technicalIssue.count({ where: { companyId: c.id, status: "open" } }),
          db.keyword.findMany({
            where: { companyId: c.id },
            orderBy: { position: "asc" },
            take: 5,
          }),
          db.seoMetric.findMany({
            where: { companyId: c.id },
            orderBy: { date: "asc" },
            select: { date: true, organicTraffic: true, visibilityScore: true, avgPosition: true, domainAuthority: true },
          }),
        ]);
      const [issues, keywords, backlinks] = await Promise.all([
        db.technicalIssue.findMany({ where: { companyId: c.id } }),
        db.keyword.findMany({ where: { companyId: c.id } }),
        db.backlink.findMany({ where: { companyId: c.id } }),
      ]);
      const seoScore = computeSeoScore({ latest, issues, keywords, backlinks });
      const trafficDelta =
        latest && first && first.organicTraffic > 0
          ? ((latest.organicTraffic - first.organicTraffic) / first.organicTraffic) * 100
          : 0;
      return {
        company: c,
        latest,
        topKeywords,
        kwCount,
        blCount,
        issueCount,
        seoScore,
        trafficDelta: Math.round(trafficDelta * 10) / 10,
        metrics,
      };
    })
  );

  return NextResponse.json({ companies: results });
}
