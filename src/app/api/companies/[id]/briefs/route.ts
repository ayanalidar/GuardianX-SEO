import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/companies/[id]/briefs — generate an AI content brief for a keyword
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { keyword } = await req.json();

  if (!keyword) {
    return NextResponse.json({ error: "keyword required" }, { status: 400 });
  }

  const company = await db.company.findUnique({
    where: { id },
    select: { name: true, website: true, industry: true, keywords: { take: 5, orderBy: { position: "asc" } } },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const systemPrompt = `You are RankForge AI, an expert SEO content strategist. Generate a comprehensive content brief as STRICT JSON only — no markdown, no prose outside JSON.`;
  const userPrompt = `Generate a content brief for the target keyword "${keyword}" for ${company.name} (industry: ${company.industry}, website: ${company.website}).

Existing top-ranking keywords for context: ${company.keywords.map((k) => k.keyword).join(", ")}

Return ONLY this JSON shape:
{
  "title": "SEO-optimized title (under 60 chars)",
  "metaDescription": "compelling meta description (under 155 chars)",
  "wordCount": recommended word count (number, 1200-3500),
  "outline": ["H2 section 1", "H2 section 2", ...] (6-8 sections, specific to the keyword),
  "relatedEntities": ["entity 1", "entity 2", ...] (8-12 semantic entities/topics to include for E-E-A-T),
  "internalLinks": ["/suggested-url-1", "/suggested-url-2", ...] (4-6 internal page paths that should link to/from this article, based on common site structure like /blog/category, /products/x)
}

Make the outline specific and actionable (not generic). Reference real SEO best practices.`;

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
      title: string;
      metaDescription: string;
      wordCount: number;
      outline: string[];
      relatedEntities: string[];
      internalLinks: string[];
    };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = {
        title: `${keyword} — Complete Guide`,
        metaDescription: `Learn everything about ${keyword}. Expert insights, tips & best practices.`,
        wordCount: 2000,
        outline: ["Introduction", `What is ${keyword}?`, "Key Benefits", "How to Get Started", "Best Practices", "Common Mistakes", "Advanced Tips", "Conclusion"],
        relatedEntities: [keyword, "strategy", "guide", "tips", "best practices"],
        internalLinks: ["/blog", "/about", "/products", "/contact"],
      };
    }

    const brief = await db.contentBrief.create({
      data: {
        companyId: id,
        keyword,
        title: parsed.title,
        metaDescription: parsed.metaDescription,
        wordCount: parsed.wordCount,
        outline: JSON.stringify(parsed.outline),
        relatedEntities: JSON.stringify(parsed.relatedEntities),
        internalLinks: JSON.stringify(parsed.internalLinks),
      },
    });

    return NextResponse.json({ brief });
  } catch (err) {
    console.error("Content brief generation failed:", err);
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
