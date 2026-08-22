import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/tasks — list tasks
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  const tasks = await db.clientTask.findMany({
    where: { clientId: client.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

// POST — create a task
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const body = await req.json();
  const { title, description, category, priority, dueDate } = body;
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const task = await db.clientTask.create({
    data: {
      clientId: client.id,
      title,
      description: description || null,
      category: category || "optimization",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  return NextResponse.json({ task });
}

// PATCH — update task status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  const body = await req.json();
  const { id, status, priority } = body;
  const data: Record<string, unknown> = {};
  if (typeof status === "string") {
    data.status = status;
    if (status === "done") data.completedAt = new Date();
  }
  if (typeof priority === "string") data.priority = priority;
  const task = await db.clientTask.update({ where: { id }, data });
  return NextResponse.json({ task });
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
  await db.clientTask.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
