import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/domains — all domains with company counts + aggregate health
export async function GET() {
  const domains = await db.domain.findMany({
    orderBy: { name: "asc" },
    include: {
      companies: {
        select: {
          id: true,
          name: true,
          slug: true,
          website: true,
          logoText: true,
          industry: true,
          location: true,
          description: true,
          employees: true,
          foundedYear: true,
        },
      },
    },
  });

  // attach latest metric + counts per company
  const enriched = await Promise.all(
    domains.map(async (d) => {
      const companies = await Promise.all(
        d.companies.map(async (c) => {
          const [latest, prev, kwCount, blCount, issueCount, recentMetrics] = await Promise.all([
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
            db.technicalIssue.count({
              where: { companyId: c.id, status: "open" },
            }),
            db.seoMetric.findMany({
              where: { companyId: c.id },
              orderBy: { date: "asc" },
              select: { visibilityScore: true, organicTraffic: true },
              take: 14,
            }),
          ]);
          const trafficDelta =
            latest && prev && prev.organicTraffic > 0
              ? ((latest.organicTraffic - prev.organicTraffic) / prev.organicTraffic) * 100
              : 0;
          // compact sparkline: array of visibility scores (0-100)
          const sparkline = recentMetrics.map((m) => Math.round(m.visibilityScore));
          return {
            ...c,
            latest,
            kwCount,
            blCount,
            issueCount,
            trafficDelta: Math.round(trafficDelta * 10) / 10,
            sparkline,
          };
        })
      );
      return { ...d, companies };
    })
  );

  return NextResponse.json({ domains: enriched });
}
