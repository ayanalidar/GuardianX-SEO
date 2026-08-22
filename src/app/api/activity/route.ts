import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/activity — recent activity feed across all companies
// Aggregates: recent competitor alerts, new insights, new backlinks, resolved issues, goal achievements
export async function GET() {
  const [recentAlerts, recentInsights, recentBacklinks, resolvedIssues, recentCompanies] =
    await Promise.all([
      db.competitorAlert.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { company: { select: { name: true, logoText: true, domain: { select: { name: true, accent: true } } } } },
      }),
      db.seoInsight.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { company: { select: { name: true, logoText: true, domain: { select: { name: true, accent: true } } } } },
      }),
      db.backlink.findMany({
        where: { status: "new" },
        orderBy: { firstSeen: "desc" },
        take: 5,
        include: { company: { select: { name: true, logoText: true, domain: { select: { name: true, accent: true } } } } },
      }),
      db.technicalIssue.findMany({
        where: { status: "resolved" },
        orderBy: { detectedAt: "desc" },
        take: 5,
        include: { company: { select: { name: true, logoText: true, domain: { select: { name: true, accent: true } } } } },
      }),
      db.company.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { domain: { select: { name: true, accent: true } } },
      }),
    ]);

  type Activity = {
    id: string;
    type: "alert" | "insight" | "backlink" | "resolved" | "onboarded";
    title: string;
    description: string;
    companyName: string;
    companyLogo: string;
    domainAccent: string;
    timestamp: string;
  };

  const activities: Activity[] = [];

  for (const a of recentAlerts) {
    activities.push({
      id: `alert-${a.id}`,
      type: "alert",
      title: a.title,
      description: a.description.slice(0, 100),
      companyName: a.company.name,
      companyLogo: a.company.logoText,
      domainAccent: a.company.domain.accent,
      timestamp: a.createdAt.toISOString(),
    });
  }
  for (const i of recentInsights) {
    activities.push({
      id: `insight-${i.id}`,
      type: "insight",
      title: `AI Insight: ${i.title}`,
      description: i.content.slice(0, 100),
      companyName: i.company.name,
      companyLogo: i.company.logoText,
      domainAccent: i.company.domain.accent,
      timestamp: i.createdAt.toISOString(),
    });
  }
  for (const b of recentBacklinks) {
    activities.push({
      id: `bl-${b.id}`,
      type: "backlink",
      title: `New backlink from ${b.sourceDomain}`,
      description: `DA ${b.domainAuthority} · ${b.linkType} · "${b.anchorText}"`,
      companyName: b.company.name,
      companyLogo: b.company.logoText,
      domainAccent: b.company.domain.accent,
      timestamp: b.firstSeen.toISOString(),
    });
  }
  for (const iss of resolvedIssues) {
    activities.push({
      id: `resolved-${iss.id}`,
      type: "resolved",
      title: `Issue resolved: ${iss.title}`,
      description: `${iss.type} · was ${iss.severity}`,
      companyName: iss.company.name,
      companyLogo: iss.company.logoText,
      domainAccent: iss.company.domain.accent,
      timestamp: iss.detectedAt.toISOString(),
    });
  }
  for (const c of recentCompanies) {
    activities.push({
      id: `new-${c.id}`,
      type: "onboarded",
      title: `${c.name} onboarded`,
      description: `Added to ${c.domain.name}`,
      companyName: c.name,
      companyLogo: c.logoText,
      domainAccent: c.domain.accent,
      timestamp: c.createdAt.toISOString(),
    });
  }

  // Sort by timestamp desc
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json({ activities: activities.slice(0, 20) });
}
