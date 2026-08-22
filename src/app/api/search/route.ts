import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/search?q=xxx — search companies & keywords across all domains
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const companies = await db.company.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { website: { contains: q } },
        { industry: { contains: q } },
        { description: { contains: q } },
        { domain: { name: { contains: q } } },
      ],
    },
    include: { domain: true },
    take: 20,
  });

  const keywords = await db.keyword.findMany({
    where: { keyword: { contains: q } },
    include: { company: { include: { domain: true } } },
    take: 15,
  });

  return NextResponse.json({
    results: {
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        website: c.website,
        industry: c.industry,
        domainId: c.domainId,
        domainName: c.domain.name,
        domainSlug: c.domain.slug,
        domainColor: c.domain.color,
      })),
      keywords: keywords.map((k) => ({
        companyId: k.companyId,
        companyName: k.company.name,
        domainName: k.company.domain.name,
        domainColor: k.company.domain.color,
        keyword: k.keyword,
        position: k.position,
        searchVolume: k.searchVolume,
      })),
    },
  });
}
