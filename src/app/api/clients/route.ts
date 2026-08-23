import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/clients — list all clients (admin)
export async function GET() {
  const clients = await db.client.findMany({
    orderBy: { onboardedAt: "desc" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          website: true,
          logoText: true,
          industry: true,
          domain: { select: { name: true, accent: true } },
        },
      },
    },
  });

  const enriched = await Promise.all(
    clients.map(async (c) => {
      const [goalCount, taskCount, completedTasks] = await Promise.all([
        db.clientGoal.count({ where: { clientId: c.id } }),
        db.clientTask.count({ where: { clientId: c.id } }),
        db.clientTask.count({ where: { clientId: c.id, status: "done" } }),
      ]);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        primaryGoal: c.primaryGoal,
        token: c.token,
        onboardedAt: c.onboardedAt,
        lastVisit: c.lastVisit,
        companyId: c.companyId,
        company: c.company,
        goalCount,
        taskCount,
        completedTasks,
      };
    })
  );

  return NextResponse.json({ clients: enriched });
}
