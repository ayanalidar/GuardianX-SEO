import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/companies/[id]/issues/[issueId]/fix — generate AI fix suggestion for a technical issue
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; issueId: string }> }
) {
  const { id, issueId } = await params;

  const issue = await db.technicalIssue.findUnique({
    where: { id: issueId },
    include: { company: { select: { name: true, website: true, industry: true } } },
  });
  if (!issue || issue.companyId !== id) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const systemPrompt = `You are RankForge AI, a senior technical SEO engineer. Provide specific, actionable fix instructions as STRICT JSON only — no markdown, no prose outside JSON.`;

  const userPrompt = `Generate a fix recommendation for this technical SEO issue:

Issue: ${issue.title}
Type: ${issue.type}
Severity: ${issue.severity}
Affected: ${issue.affectedCount} pages
Company: ${issue.company.name} (${issue.company.website})
Industry: ${issue.company.industry}

Return ONLY this JSON shape:
{
  "summary": "one-line summary of the fix (max 100 chars)",
  "steps": ["step 1", "step 2", ...] (4-6 concrete implementation steps),
  "estimatedImpact": "expected impact on rankings/traffic (1 sentence)",
  "priority": "high" | "medium" | "low",
  "resources": ["relevant doc URL or tool", ...] (2-3 helpful resources)
}`;

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: {
      summary: string;
      steps: string[];
      estimatedImpact: string;
      priority: string;
      resources: string[];
    };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = {
        summary: `Fix ${issue.title} to improve technical SEO health.`,
        steps: ["Audit affected pages", "Identify root cause", "Apply fix", "Re-test", "Monitor rankings"],
        estimatedImpact: "Improving this issue will boost crawlability and rankings.",
        priority: issue.severity === "critical" ? "high" : "medium",
        resources: ["Google Search Console", "PageSpeed Insights"],
      };
    }
    return NextResponse.json({ fix: parsed });
  } catch (err) {
    console.error("Issue fix generation failed:", err);
    return NextResponse.json({ error: "Failed to generate fix" }, { status: 500 });
  }
}
