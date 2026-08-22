import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/companies?domainId=xxx — list companies in a domain (lightweight)
export async function GET(req: NextRequest) {
  const domainId = req.nextUrl.searchParams.get("domainId");
  const companies = await db.company.findMany({
    where: domainId ? { domainId } : undefined,
    orderBy: { name: "asc" },
    include: { domain: true },
  });
  return NextResponse.json({ companies });
}
