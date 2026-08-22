import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/goals — list goals
// POST — create a goal
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  const goals = await db.clientGoal.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ goals });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const body = await req.json();
  const { type, label, target, deadline } = body;
  if (!type || !label || !target) {
    return NextResponse.json({ error: "type, label, target required" }, { status: 400 });
  }
  const goal = await db.clientGoal.create({
    data: {
      clientId: client.id,
      type,
      label,
      target: Number(target),
      current: body.current ? Number(body.current) : 0,
      deadline: deadline ? new Date(deadline) : null,
    },
  });
  return NextResponse.json({ goal });
}

// PATCH — update goal (e.g. target)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const body = await req.json();
  const { id, target, status } = body;
  const data: Record<string, unknown> = {};
  if (typeof target === "number") data.target = target;
  if (typeof status === "string") data.status = status;
  const goal = await db.clientGoal.update({
    where: { id },
    data,
  });
  return NextResponse.json({ goal });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.clientGoal.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
