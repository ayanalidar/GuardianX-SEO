import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/client/[token]/optimize-content
// Body: { targetUrl, targetKeyword }
// Fetches URL content, sends to LLM for SEO analysis.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({
    where: { token },
    include: { company: true },
  });
  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const body = await req.json();
  const { targetUrl, targetKeyword } = body as { targetUrl?: string; targetKeyword?: string };
  if (!targetUrl || typeof targetUrl !== "string") {
    return NextResponse.json({ error: "targetUrl required" }, { status: 400 });
  }
  if (!targetKeyword || typeof targetKeyword !== "string") {
    return NextResponse.json({ error: "targetKeyword required" }, { status: 400 });
  }

  // Fetch the URL
  let html = "";
  let httpStatus = 0;
  let fetchMs = 0;
  try {
    const t0 = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(targetUrl, {
      headers: { "User-Agent": "GuardianX-SEO-ContentBot/1.0" },
      signal: controller.signal,
      redirect: "follow",
    });
    html = await res.text();
    httpStatus = res.status;
    fetchMs = Date.now() - t0;
    clearTimeout(timeout);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch targetUrl", message: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }

  // Extract page metadata for the LLM context
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const metaDescription = metaMatch ? metaMatch[1].trim() : "";
  const h1s: string[] = [];
  const h1re = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let m: RegExpExecArray | null;
  while ((m = h1re.exec(html))) h1s.push(m[1].replace(/<[^>]+>/g, "").trim());
  const h2s: string[] = [];
  const h2re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  while ((m = h2re.exec(html))) h2s.push(m[1].replace(/<[^>]+>/g, "").trim());
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const keywordRegex = new RegExp(targetKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const keywordMatches = (bodyText.match(keywordRegex) || []).length;
  const keywordDensity = wordCount > 0 ? Math.round((keywordMatches / wordCount) * 10000) / 100 : 0;

  // Trim content for the LLM prompt (avoid exceeding context limits)
  const trimmedContent = bodyText.slice(0, 12000);
  const contextJson = JSON.stringify({
    url: targetUrl,
    targetKeyword,
    httpStatus,
    fetchMs,
    title,
    metaDescription,
    h1s: h1s.slice(0, 5),
    h2s: h2s.slice(0, 15),
    wordCount,
    keywordMatches,
    keywordDensity,
    contentPreview: trimmedContent,
  }, null, 2);

  const systemPrompt = `You are GuardianX SEO Content Analyzer, a senior SEO editor. Analyze content for on-page SEO strength and produce concrete, prioritized recommendations. Output STRICT valid JSON only — no markdown, no prose.`;

  const userPrompt = `Analyze the page below for the target keyword "${targetKeyword}".

PAGE DATA:
${contextJson}

Return ONLY this JSON shape:
{
  "contentScore": <0-100>,
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "category": "title" | "meta" | "headings" | "content" | "keywords" | "links" | "media" | "technical",
      "title": "short recommendation title",
      "description": "1-3 sentence explanation with specific actions"
    }
  ],
  "keywordDensity": <number>,
  "readability": {
    "score": <0-100>,
    "level": "easy" | "medium" | "hard",
    "avgSentenceLength": <number>
  },
  "wordCountTarget": <recommended word count>,
  "suggestedHeadings": ["H2 #1", "H2 #2", ...]
}

Be specific and reference real values from the data. Identify missing or thin sections, keyword stuffing or under-optimization, weak title/meta, missing internal links, missing media, etc.`;

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
      contentScore: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: Array<{ priority: string; category: string; title: string; description: string }>;
      keywordDensity: number;
      readability: { score: number; level: string; avgSentenceLength: number };
      wordCountTarget: number;
      suggestedHeadings: string[];
    };

    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = {
        contentScore: 50,
        strengths: ["Page loads successfully", `Has ${wordCount} words of content`],
        weaknesses: ["Could not parse LLM response — review manually"],
        recommendations: [
          {
            priority: "high",
            category: "keywords",
            title: `Optimize for "${targetKeyword}"`,
            description: `Ensure the keyword appears in title, H1, and naturally throughout the content. Current density: ${keywordDensity}%.`,
          },
        ],
        keywordDensity,
        readability: { score: 60, level: "medium", avgSentenceLength: 18 },
        wordCountTarget: Math.max(1500, wordCount + 500),
        suggestedHeadings: [`What is ${targetKeyword}?`, `Benefits of ${targetKeyword}`, `How to ${targetKeyword}`, `${targetKeyword} best practices`, `Common ${targetKeyword} mistakes`, `Conclusion`],
      };
    }

    return NextResponse.json({
      ...parsed,
      targetUrl,
      targetKeyword,
      actualWordCount: wordCount,
      actualKeywordMatches: keywordMatches,
      httpStatus,
      fetchMs,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("optimize-content failed:", err);
    return NextResponse.json(
      { error: "Failed to analyze content", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
