import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createChatCompletion } from "@/lib/seo/llm";

// POST /api/companies/[id]/insights
// Generates AI-powered SEO recommendations based on the company's data
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    include: { domain: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const [latest, topKeywords, issues, contentGaps, competitors, backlinks] =
    await Promise.all([
      db.seoMetric.findFirst({
        where: { companyId: id },
        orderBy: { date: "desc" },
      }),
      db.keyword.findMany({
        where: { companyId: id },
        orderBy: { position: "asc" },
        take: 8,
      }),
      db.technicalIssue.findMany({
        where: { companyId: id, status: "open" },
        orderBy: [{ severity: "desc" }],
        take: 6,
      }),
      db.contentGap.findMany({
        where: { companyId: id },
        orderBy: { opportunity: "desc" },
        take: 5,
      }),
      db.competitor.findMany({
        where: { companyId: id },
        orderBy: { organicTraffic: "desc" },
        take: 4,
      }),
      db.backlink.findMany({
        where: { companyId: id },
        orderBy: { domainAuthority: "desc" },
        take: 5,
      }),
    ]);

  const context = {
    company: {
      name: company.name,
      website: company.website,
      industry: company.industry,
      domain: company.domain.name,
    },
    latest: latest
      ? {
          organicTraffic: latest.organicTraffic,
          keywordsRanked: latest.keywordsRanked,
          domainAuthority: latest.domainAuthority,
          avgPosition: latest.avgPosition,
          visibilityScore: latest.visibilityScore,
          ctr: latest.ctr,
          bounceRate: latest.bounceRate,
          avgLoadTime: latest.avgLoadTime,
        }
      : null,
    topKeywords: topKeywords.map((k) => ({
      keyword: k.keyword,
      position: k.position,
      searchVolume: k.searchVolume,
      difficulty: k.difficulty,
    })),
    issues: issues.map((i) => ({ type: i.type, severity: i.severity, title: i.title })),
    contentGaps: contentGaps.map((g) => ({
      keyword: g.keyword,
      searchVolume: g.searchVolume,
      opportunity: g.opportunity,
    })),
    competitors: competitors.map((c) => ({
      name: c.name,
      domainAuthority: c.domainAuthority,
      organicTraffic: c.organicTraffic,
      trafficOverlap: c.trafficOverlap,
    })),
    topBacklinks: backlinks.map((b) => ({
      sourceDomain: b.sourceDomain,
      domainAuthority: b.domainAuthority,
      anchorText: b.anchorText,
    })),
  };

  const systemPrompt = `You are RankForge AI, a senior SEO strategist with 15+ years of experience. You analyze search performance data and produce specific, prioritized, actionable optimization recommendations. Always be concise, data-driven, and concrete. Output STRICT valid JSON only — no markdown, no prose outside JSON.`;

  const userPrompt = `Analyze this SEO profile and generate 4 prioritized insights as JSON.

SEO PROFILE:
${JSON.stringify(context, null, 2)}

Return ONLY this JSON shape (no extra text, no code fences):
{
  "insights": [
    {
      "type": "opportunity" | "warning" | "action" | "competitive",
      "title": "short compelling headline (max 10 words)",
      "content": "2-4 sentences with specific numbers and a concrete next step",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Focus on: quick wins, declining metrics, content gaps to capture, technical fixes with highest impact, and competitive positioning. Reference real numbers from the data.`;

  try {
    const completion = await createChatCompletion(
      [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { thinking: "disabled" }
    );

    const raw = completion.choices[0]?.message?.content ?? "";

    // Extract JSON robustly
    let parsed: { insights: Array<{ type: string; title: string; content: string; priority: string }> };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      // Fallback if LLM doesn't return clean JSON
      parsed = {
        insights: [
          {
            type: "action",
            title: "Optimize top-ranking keywords",
            content: raw.slice(0, 400),
            priority: "high",
          },
        ],
      };
    }

    // Persist insights
    const created = await Promise.all(
      parsed.insights.slice(0, 5).map((ins) =>
        db.seoInsight.create({
          data: {
            companyId: id,
            type: ins.type,
            title: ins.title,
            content: ins.content,
            priority: ins.priority,
          },
        })
      )
    );

    return NextResponse.json({ insights: created });
  } catch (err) {
    console.error("AI insight generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
