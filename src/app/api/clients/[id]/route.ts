import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE /api/clients/[id] — deletes a client + their company + all data
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    select: { id: true, companyId: true, name: true, company: { select: { name: true } } },
  });

  if (client) {
    await db.client.delete({ where: { id } });
    await db.company.delete({ where: { id: client.companyId } });
    return NextResponse.json({ success: true, deleted: "client+company", clientName: client.name, companyName: client.company.name });
  }

  const company = await db.company.findUnique({
    where: { id },
    select: { id: true, name: true, client: { select: { id: true, name: true } } },
  });

  if (company) {
    await db.company.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: "company", companyName: company.name, clientName: company.client?.name || null });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
