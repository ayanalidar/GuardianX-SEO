import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/notifications — aggregate all notifications across all companies
// Returns: competitor alerts (unread), achieved goals, overdue tasks, recent insights
export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 30);

  const [alerts, clients, recentCompanies] = await Promise.all([
    db.competitorAlert.findMany({
      where: { read: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { company: { select: { name: true, logoText: true, domain: { select: { name: true, accent: true } } } } },
    }),
    db.client.findMany({
      include: {
        goals: true,
        tasks: true,
        company: { select: { name: true, logoText: true, domain: { select: { name: true, accent: true } } } },
      },
    }),
    db.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, logoText: true, createdAt: true, domain: { select: { name: true, accent: true } } },
    }),
  ]);

  type Notification = {
    id: string;
    type: "alert" | "goal" | "task-overdue" | "new-company";
    severity: "info" | "warning" | "critical" | "success";
    title: string;
    description: string;
    companyName: string;
    companyLogo: string;
    domainAccent: string;
    createdAt: string;
    link?: string;
  };

  const notifications: Notification[] = [];

  // Competitor alerts
  for (const a of alerts) {
    notifications.push({
      id: a.id,
      type: "alert",
      severity: a.severity as "info" | "warning" | "critical",
      title: a.title,
      description: a.description,
      companyName: a.company.name,
      companyLogo: a.company.logoText,
      domainAccent: a.company.domain.accent,
      createdAt: a.createdAt.toISOString(),
    });
  }

  // Achieved goals + overdue tasks (from clients)
  for (const client of clients) {
    for (const g of client.goals) {
      // recompute progress roughly
      const progress = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
      if (progress >= 100 && g.status !== "achieved") {
        notifications.push({
          id: `goal-${g.id}`,
          type: "goal",
          severity: "success",
          title: `Goal achieved: ${g.label}`,
          description: `${client.company.name} hit 100% on their ${g.label} target!`,
          companyName: client.company.name,
          companyLogo: client.company.logoText,
          domainAccent: client.company.domain.accent,
          createdAt: g.createdAt.toISOString(),
        });
      }
    }
    for (const t of client.tasks) {
      if (t.dueDate && t.dueDate < new Date() && t.status !== "done") {
        notifications.push({
          id: `task-${t.id}`,
          type: "task-overdue",
          severity: "warning",
          title: `Task overdue: ${t.title}`,
          description: `Overdue for ${client.company.name}`,
          companyName: client.company.name,
          companyLogo: client.company.logoText,
          domainAccent: client.company.domain.accent,
          createdAt: t.dueDate.toISOString(),
        });
      }
    }
  }

  // New companies onboarded
  for (const c of recentCompanies) {
    notifications.push({
      id: `new-${c.id}`,
      type: "new-company",
      severity: "info",
      title: `New client onboarded: ${c.name}`,
      description: `Added to ${c.domain.name} domain`,
      companyName: c.name,
      companyLogo: c.logoText,
      domainAccent: c.domain.accent,
      createdAt: c.createdAt.toISOString(),
    });
  }

  // Sort by date desc
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    notifications: notifications.slice(0, limit),
    unreadCount: notifications.filter((n) => n.type === "alert" || n.type === "task-overdue").length,
  });
}
