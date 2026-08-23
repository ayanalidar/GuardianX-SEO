import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createChatCompletion } from "@/lib/seo/llm";

// POST /api/companies/[id]/forecast — AI-powered SEO forecast
// Projects traffic, keyword count, and avg position 30/60/90 days ahead
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    select: { name: true, website: true, industry: true, keywords: { take: 5, orderBy: { position: "asc" } } },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const metrics = await db.seoMetric.findMany({
    where: { companyId: id },
    orderBy: { date: "asc" },
  });

  if (metrics.length < 5) {
    return NextResponse.json({ error: "Not enough historical data" }, { status: 400 });
  }

  // Compute linear trend from last 30 days for each metric
  const latest = metrics[metrics.length - 1];
  const first = metrics[0];

  const projectLinear = (key: "organicTraffic" | "keywordsRanked" | "avgPosition" | "domainAuthority", days: number) => {
    const recent = metrics.slice(-Math.min(14, metrics.length));
    if (recent.length < 2) return latest[key];
    const slope = (recent[recent.length - 1][key] - recent[0][key]) / recent.length;
    const projected = latest[key] + slope * days;
    return key === "avgPosition" ? Math.max(1, projected) : Math.max(0, Math.round(projected));
  };

  const forecast30 = {
    traffic: projectLinear("organicTraffic", 30),
    keywords: projectLinear("keywordsRanked", 30),
    position: Math.round(projectLinear("avgPosition", 30) * 10) / 10,
    authority: Math.round(projectLinear("domainAuthority", 30) * 10) / 10,
  };
  const forecast60 = {
    traffic: projectLinear("organicTraffic", 60),
    keywords: projectLinear("keywordsRanked", 60),
    position: Math.round(projectLinear("avgPosition", 60) * 10) / 10,
    authority: Math.round(projectLinear("domainAuthority", 60) * 10) / 10,
  };
  const forecast90 = {
    traffic: projectLinear("organicTraffic", 90),
    keywords: projectLinear("keywordsRanked", 90),
    position: Math.round(projectLinear("avgPosition", 90) * 10) / 10,
    authority: Math.round(projectLinear("domainAuthority", 90) * 10) / 10,
  };

  // Get AI narrative
  const systemPrompt = `You are RankForge AI, an expert SEO analyst. Provide a forecast narrative as STRICT JSON only — no markdown, no prose outside JSON.`;
  const userPrompt = `Generate a 90-day SEO forecast narrative for ${company.name} (${company.industry}).

Current metrics:
- Organic traffic: ${latest.organicTraffic.toLocaleString()} (30-day delta: ${(((latest.organicTraffic - first.organicTraffic) / Math.max(1, first.organicTraffic)) * 100).toFixed(1)}%)
- Keywords ranked: ${latest.keywordsRanked.toLocaleString()}
- Avg position: #${latest.avgPosition.toFixed(1)}
- Domain authority: ${latest.domainAuthority.toFixed(1)}
- Visibility score: ${latest.visibilityScore.toFixed(1)}%

Projected 90-day: traffic ${forecast90.traffic.toLocaleString()}, keywords ${forecast90.keywords.toLocaleString()}, position #${forecast90.position}, DA ${forecast90.authority}.

Return ONLY this JSON:
{
  "summary": "2-3 sentence forecast summary with specific numbers",
  "confidence": "high" | "medium" | "low",
  "keyDrivers": ["driver 1", "driver 2", "driver 3"] (factors influencing the forecast),
  "risks": ["risk 1", "risk 2"] (factors that could derail it),
  "recommendations": ["action 1", "action 2", "action 3"] (to maximize growth)
}`;

  let narrative: {
    summary: string;
    confidence: string;
    keyDrivers: string[];
    risks: string[];
    recommendations: string[];
  };

  try {
    const completion = await createChatCompletion(
      [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { thinking: "disabled" }
    );
    const raw = completion.choices[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    narrative = JSON.parse(match ? match[0] : raw);
  } catch {
    narrative = {
      summary: `Based on current trends, ${company.name} is projected to reach ${forecast90.traffic.toLocaleString()} monthly visits and #${forecast90.position} avg position within 90 days.`,
      confidence: "medium",
      keyDrivers: ["Consistent traffic growth trend", "Stable keyword rankings", "Improving domain authority"],
      risks: ["Search algorithm updates", "Increased competitor activity"],
      recommendations: ["Continue content production", "Build authoritative backlinks", "Monitor Core Web Vitals"],
    };
  }

  return NextResponse.json({
    current: {
      traffic: latest.organicTraffic,
      keywords: latest.keywordsRanked,
      position: latest.avgPosition,
      authority: latest.domainAuthority,
    },
    forecast30,
    forecast60,
    forecast90,
    narrative,
  });
}
