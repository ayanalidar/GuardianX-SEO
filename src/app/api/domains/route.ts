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
          const latest = await db.seoMetric.findFirst({
            where: { companyId: c.id },
            orderBy: { date: "desc" },
          });
          const prev = await db.seoMetric.findFirst({
            where: { companyId: c.id },
            orderBy: { date: "asc" },
          });
          const kwCount = await db.keyword.count({ where: { companyId: c.id } });
          const blCount = await db.backlink.count({ where: { companyId: c.id } });
          const issueCount = await db.technicalIssue.count({
            where: { companyId: c.id, status: "open" },
          });
          const trafficDelta =
            latest && prev && prev.organicTraffic > 0
              ? ((latest.organicTraffic - prev.organicTraffic) / prev.organicTraffic) * 100
              : 0;
          return {
            ...c,
            latest,
            kwCount,
            blCount,
            issueCount,
            trafficDelta: Math.round(trafficDelta * 10) / 10,
          };
        })
      );
      return { ...d, companies };
    })
  );

  return NextResponse.json({ domains: enriched });
}
