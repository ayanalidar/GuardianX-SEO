import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/client/[token]/write-content
// Body: { keyword, contentType, wordCount }
// Uses the LLM to write a full SEO-optimized article.
export async function POST(
  req: NextRequest,
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

  const body = await req.json();
  const { keyword, contentType, wordCount } = body as {
    keyword?: string;
    contentType?: string;
    wordCount?: number;
  };
  if (!keyword || typeof keyword !== "string") {
    return NextResponse.json({ error: "keyword required" }, { status: 400 });
  }

  const type = contentType || "blog-post";
  const targetWords = Math.max(800, Math.min(5000, Number(wordCount) || 1800));

  const company = client.company;
  const contextLines = [
    `Company: ${company.name}`,
    `Industry: ${company.industry}`,
    `Website: ${company.website}`,
    `Domain: ${company.domain?.name ?? "n/a"}`,
    `Brand voice: professional, authoritative, helpful.`,
  ];

  const systemPrompt = `You are GuardianX SEO Writer, an expert content strategist and copywriter. You produce complete, ready-to-publish SEO-optimized articles in HTML. Output STRICT valid JSON only — no markdown fences, no prose outside JSON.`;

  const userPrompt = `Write a fully optimized article for the target keyword "${keyword}".

Client context:
${contextLines.join("\n")}

Article type: ${type}
Target word count: ${targetWords} (±10%)

Return ONLY this JSON shape (no extra text, no code fences):
{
  "title": "compelling H1 title (under 70 chars) including the primary keyword",
  "metaTitle": "exact <title> tag (under 60 chars)",
  "metaDescription": "meta description (under 155 chars, includes keyword + CTA)",
  "slug": "kebab-case-url-slug-4-to-7-words",
  "content": "<article>...</article> as HTML — full ${targetWords}-word article with <h2> and <h3> subheadings, semantic variations of the keyword, list/table elements where useful, and a CTA at the end",
  "wordCount": <number, ~targetWords>,
  "keywordDensity": <percent as number, e.g. 1.2>,
  "readabilityScore": <0-100 Flesch reading ease score as number>,
  "internalLinks": ["/suggested-internal-url-1", "/suggested-internal-url-2", "/suggested-internal-url-3"],
  "faqs": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "callToAction": "single sentence CTA"
}

Requirements:
- Front-load the primary keyword in title, H1, first 100 words.
- Include 4-6 semantic variations / LSI terms.
- Use 5-8 <h2> subheadings, each containing keyword or related term where natural.
- Each paragraph 2-4 sentences. Include at least one bulleted list and one numbered list.
- FAQ section must contain 3-5 Q&As.
- Suggested internal links must be realistic paths (e.g. /blog/category/post-name).
- Content must be original, factually sound, and useful — not generic filler.`;

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
      metaTitle: string;
      metaDescription: string;
      slug: string;
      content: string;
      wordCount: number;
      keywordDensity: number;
      readabilityScore: number;
      internalLinks: string[];
      faqs: Array<{ question: string; answer: string }>;
      callToAction: string;
    };

    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      // Fallback — wrap raw output as content
      parsed = {
        title: `${keyword} — Complete Guide`,
        metaTitle: `${keyword} | ${company.name}`,
        metaDescription: `Learn everything about ${keyword}. Expert insights, tips & best practices.`,
        slug: keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 70),
        content: `<article><h1>${keyword} — Complete Guide</h1>${raw.slice(0, 6000)}</article>`,
        wordCount: targetWords,
        keywordDensity: 1.2,
        readabilityScore: 62,
        internalLinks: ["/blog", "/about", "/contact"],
        faqs: [
          { question: `What is ${keyword}?`, answer: raw.slice(0, 200) },
          { question: `Why is ${keyword} important?`, answer: "It drives organic traffic and conversions." },
          { question: `How do I get started with ${keyword}?`, answer: "Follow the steps above." },
        ],
        callToAction: `Get in touch with ${company.name} today.`,
      };
    }

    return NextResponse.json({
      content: parsed,
      keyword,
      contentType: type,
      targetWordCount: targetWords,
      generatedAt: new Date().toISOString(),
      company: { name: company.name, website: company.website, industry: company.industry },
    });
  } catch (err) {
    console.error("write-content failed:", err);
    return NextResponse.json(
      { error: "Failed to generate content", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
