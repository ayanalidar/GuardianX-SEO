import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/companies/[id]/alerts — mark alert(s) as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (body.all) {
    await db.competitorAlert.updateMany({
      where: { companyId: id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  }
  if (body.id) {
    await db.competitorAlert.update({
      where: { id: body.id },
      data: { read: body.read ?? true },
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "id or all required" }, { status: 400 });
}
