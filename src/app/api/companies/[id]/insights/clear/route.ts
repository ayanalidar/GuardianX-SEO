import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE /api/companies/[id]/insights/clear — clear all AI insights for a company
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db.seoInsight.deleteMany({ where: { companyId: id } });
  return NextResponse.json({ deleted: result.count });
}
