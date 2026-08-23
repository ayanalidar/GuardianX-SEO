import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/roadmap — builds a 4-week prioritized action plan from real issues,
// content gaps, and competitor data.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({
    where: { token },
    include: { company: { include: { domain: true } } },
  });
  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const companyId = client.companyId;
  const [issues, contentGaps, competitors, latest, keywords, insights] = await Promise.all([
    db.technicalIssue.findMany({ where: { companyId, status: "open" }, orderBy: [{ severity: "asc" }, { detectedAt: "desc" }] }),
    db.contentGap.findMany({ where: { companyId }, orderBy: { opportunity: "desc" }, take: 12 }),
    db.competitor.findMany({ where: { companyId }, orderBy: { organicTraffic: "desc" }, take: 5 }),
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "desc" } }),
    db.keyword.findMany({ where: { companyId }, orderBy: { position: "asc" }, take: 8 }),
    db.seoInsight.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  // Group issues by severity
  const criticalIssues = issues.filter((i) => i.severity === "critical");
  const warningIssues = issues.filter((i) => i.severity === "warning");
  const infoIssues = issues.filter((i) => i.severity === "info");

  // Build week buckets
  const weeks: Array<{
    week: number;
    label: string;
    theme: string;
    actions: Array<{
      id: string;
      title: string;
      category: string;
      priority: "critical" | "high" | "medium" | "low";
      effort: "S" | "M" | "L";
      impact: number;
      description: string;
      source: string;
    }>;
  }> = [
    {
      week: 1,
      label: "Week 1 — Stabilize",
      theme: "Fix critical technical issues + quick wins",
      actions: [],
    },
    {
      week: 2,
      label: "Week 2 — Capture Content Gaps",
      theme: "Target missed keyword opportunities",
      actions: [],
    },
    {
      week: 3,
      label: "Week 3 — Competitive Counter",
      theme: "Reclaim lost SERP features and outrank competitors",
      actions: [],
    },
    {
      week: 4,
      label: "Week 4 — Authority & Backlinks",
      theme: "Build authority via outreach and link acquisition",
      actions: [],
    },
  ];

  // Week 1 — Critical issues + on-page optimizations
  criticalIssues.slice(0, 4).forEach((iss, i) => {
    weeks[0].actions.push({
      id: `w1-crit-${i + 1}`,
      title: `Fix: ${iss.title}`,
      category: iss.type,
      priority: "critical",
      effort: iss.affectedCount > 10 ? "L" : iss.affectedCount > 3 ? "M" : "S",
      impact: 90,
      description: iss.description,
      source: "issue",
    });
  });
  warningIssues.slice(0, 3).forEach((iss, i) => {
    weeks[0].actions.push({
      id: `w1-warn-${i + 1}`,
      title: `Address: ${iss.title}`,
      category: iss.type,
      priority: "high",
      effort: "M",
      impact: 65,
      description: iss.description,
      source: "issue",
    });
  });
  keywords.filter((k) => k.position >= 4 && k.position <= 10).slice(0, 3).forEach((k, i) => {
    weeks[0].actions.push({
      id: `w1-kw-${i + 1}`,
      title: `Push "${k.keyword}" from #${k.position} into top 3`,
      category: "on-page",
      priority: "high",
      effort: "S",
      impact: 75,
      description: `Optimize title, add internal links, refresh content for "${k.keyword}" (currently ranking #${k.position}, search volume: ${k.searchVolume}/mo).`,
      source: "keyword",
    });
  });

  // Week 2 — Content gaps
  contentGaps.slice(0, 6).forEach((gap, i) => {
    weeks[1].actions.push({
      id: `w2-gap-${i + 1}`,
      title: `Publish article targeting "${gap.keyword}"`,
      category: "content",
      priority: gap.opportunity > 70 ? "high" : gap.opportunity > 40 ? "medium" : "low",
      effort: gap.difficulty > 60 ? "L" : gap.difficulty > 30 ? "M" : "S",
      impact: Math.round(gap.opportunity),
      description: `Competitors ranking for "${gap.keyword}" (vol ${gap.searchVolume}/mo, diff ${gap.difficulty}). Competitors: ${gap.competitorRanking}.`,
      source: "content-gap",
    });
  });

  // Week 3 — Competitive counter-moves
  competitors.slice(0, 3).forEach((comp, i) => {
    weeks[2].actions.push({
      id: `w3-comp-${i + 1}`,
      title: `Counter ${comp.name}'s content lead`,
      category: "competitive",
      priority: "high",
      effort: "L",
      impact: 70,
      description: `${comp.name} has ${comp.organicTraffic.toLocaleString()} monthly visits with ${comp.commonKeywords} shared keywords (overlap: ${Math.round(comp.trafficOverlap * 100)}%). Audit their top pages and create 10x better versions.`,
      source: "competitor",
    });
  });
  insights.filter((i) => i.type === "competitive" || i.type === "action").slice(0, 3).forEach((ins, i) => {
    weeks[2].actions.push({
      id: `w3-ins-${i + 1}`,
      title: ins.title,
      category: "insight",
      priority: ins.priority as "high" | "medium" | "low",
      effort: "M",
      impact: 60,
      description: ins.content,
      source: "insight",
    });
  });

  // Week 4 — Backlinks / authority
  if (latest && latest.backlinks > 0) {
    weeks[3].actions.push({
      id: "w4-out-1",
      title: `Launch HARO / digital PR campaign (target +${Math.round(latest.backlinks * 0.15)} referring domains)`,
      category: "outreach",
      priority: "high",
      effort: "L",
      impact: 80,
      description: `Current backlink profile: ${latest.backlinks} backlinks, ${latest.referringDomains} referring domains. Goal: grow referring domains by 15%.`,
      source: "authority",
    });
  }
  weeks[3].actions.push({
    id: "w4-out-2",
    title: "Identify 20 unlinked brand mentions → convert to backlinks",
    category: "outreach",
    priority: "medium",
    effort: "M",
    impact: 55,
    description: "Run a brand mention audit (BuzzStream / Awario). Reach out to sites mentioning you without a link.",
    source: "outreach",
  });
  weeks[3].actions.push({
    id: "w4-out-3",
    title: "Pitch 5 guest posts to industry publications",
    category: "outreach",
    priority: "medium",
    effort: "L",
    impact: 60,
    description: `Identify DA 40+ sites in "${client.company.industry}" and pitch thought-leadership articles with bio backlinks.`,
    source: "outreach",
  });

  // Flatten for summary
  const allActions = weeks.flatMap((w) => w.actions);
  const totalActions = allActions.length;
  const criticalActions = allActions.filter((a) => a.priority === "critical").length;

  // Projected gains — heuristic
  const baseTraffic = latest?.organicTraffic ?? 1000;
  const projectedTrafficGain = Math.round(
    baseTraffic * (0.04 + criticalActions * 0.02 + allActions.filter((a) => a.category === "content").length * 0.025)
  );
  const aov = 85;
  const projectedRevenueGain = Math.round((projectedTrafficGain * 0.025) * aov);

  const goals = [
    { type: "traffic", label: "Organic traffic", current: baseTraffic, target: baseTraffic + projectedTrafficGain, deadline: addDays(28) },
    { type: "keywords", label: "Keywords in top 10", current: latest?.keywordsRanked ?? 0, target: (latest?.keywordsRanked ?? 0) + contentGaps.length, deadline: addDays(28) },
    { type: "issues", label: "Critical issues resolved", current: 0, target: criticalIssues.length, deadline: addDays(7) },
    { type: "authority", label: "Referring domains", current: latest?.referringDomains ?? 0, target: Math.round((latest?.referringDomains ?? 0) * 1.15), deadline: addDays(28) },
  ];

  return NextResponse.json({
    roadmap: weeks,
    summary: {
      totalActions,
      criticalActions,
      projectedTrafficGain,
      projectedRevenueGain,
      weeksPlanned: 4,
      horizon: "28 days",
    },
    goals,
    generatedAt: new Date().toISOString(),
  });
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
