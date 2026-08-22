import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/export/companies — CSV export of all companies summary
export async function GET() {
  const companies = await db.company.findMany({
    include: { domain: true },
    orderBy: { name: "asc" },
  });

  const rows: Array<Record<string, string | number>> = [];
  for (const c of companies) {
    const latest = await db.seoMetric.findFirst({
      where: { companyId: c.id },
      orderBy: { date: "desc" },
    });
    const kwCount = await db.keyword.count({ where: { companyId: c.id } });
    const blCount = await db.backlink.count({ where: { companyId: c.id } });
    const issueCount = await db.technicalIssue.count({
      where: { companyId: c.id, status: "open" },
    });
    rows.push({
      Name: c.name,
      Website: c.website,
      Industry: c.industry,
      Domain: c.domain.name,
      Location: c.location,
      Employees: c.employees,
      Founded: c.foundedYear,
      Traffic: latest?.organicTraffic ?? 0,
      Keywords: latest?.keywordsRanked ?? 0,
      "Avg Position": latest?.avgPosition?.toFixed(1) ?? "—",
      "Domain Authority": latest?.domainAuthority?.toFixed(1) ?? "—",
      Visibility: latest?.visibilityScore?.toFixed(1) ?? "—",
      Backlinks: latest?.backlinks ?? 0,
      "Tracked Keywords": kwCount,
      "Tracked Backlinks": blCount,
      "Open Issues": issueCount,
    });
  }

  const headers = Object.keys(rows[0] ?? { Name: "" });
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => {
        const v = r[h];
        const s = String(v);
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      }).join(",")
    ),
  ].join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rankforge-companies-${date}.csv"`,
    },
  });
}
