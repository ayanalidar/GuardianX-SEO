import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/export?companyId=xxx&type=keywords|backlinks — CSV export
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const type = req.nextUrl.searchParams.get("type") ?? "keywords";

  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { name: true, website: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  let csv: string;
  let filename: string;

  if (type === "backlinks") {
    const rows = await db.backlink.findMany({
      where: { companyId },
      orderBy: { domainAuthority: "desc" },
    });
    const header = [
      "Source Domain",
      "Source URL",
      "Anchor Text",
      "Domain Authority",
      "Link Type",
      "Status",
      "First Seen",
      "Traffic",
    ].join(",");
    const body = rows
      .map((r) =>
        [
          esc(r.sourceDomain),
          esc(r.sourceUrl),
          esc(r.anchorText),
          r.domainAuthority,
          r.linkType,
          r.status,
          new Date(r.firstSeen).toISOString().slice(0, 10),
          r.traffic,
        ].join(",")
      )
      .join("\n");
    csv = `${header}\n${body}`;
    filename = `${company.name}-backlinks-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    const rows = await db.keyword.findMany({
      where: { companyId },
      orderBy: { position: "asc" },
    });
    const header = [
      "Keyword",
      "Position",
      "Previous Position",
      "Change",
      "Search Volume",
      "Difficulty",
      "CPC",
      "Intent",
      "URL",
    ].join(",");
    const body = rows
      .map((r) => {
        const change = r.previousPosition - r.position;
        return [
          esc(r.keyword),
          r.position,
          r.previousPosition,
          change,
          r.searchVolume,
          r.difficulty,
          r.cpc,
          r.intent,
          esc(r.url),
        ].join(",");
      })
      .join("\n");
    csv = `${header}\n${body}`;
    filename = `${company.name}-keywords-${new Date().toISOString().slice(0, 10)}.csv`;
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function esc(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
