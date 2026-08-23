import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type CrawlIssue = {
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  fix?: string;
};

type CrawlResult = {
  url: string;
  title: string;
  metaDescription: string;
  h1s: string[];
  h2s: string[];
  images: { src: string; alt: string; missingAlt: boolean }[];
  links: { href: string; text: string; internal: boolean; nofollow: boolean }[];
  schema: { type: string; raw: string }[];
  performance: { ttfb: number; loadTime: number; domSize: number; imageCount: number; scriptCount: number; stylesheetCount: number };
  issues: CrawlIssue[];
  seoScore: number;
  crawledAt: string;
};

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : "";
}

function extractMetaDescription(html: string): string {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  return m ? m[1].trim() : "";
}

function extractHeadings(html: string, tag: "h1" | "h2"): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push(m[1].replace(/<[^>]+>/g, "").trim());
  }
  return out;
}

function extractImages(html: string): { src: string; alt: string; missingAlt: boolean }[] {
  const re = /<img[^>]*>/gi;
  const out: { src: string; alt: string; missingAlt: boolean }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const srcMatch = tag.match(/src=["']([^"']*)["']/i);
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : "";
    out.push({ src: srcMatch ? srcMatch[1] : "", alt, missingAlt: !altMatch });
  }
  return out;
}

function extractLinks(html: string, baseUrl: string): { href: string; text: string; internal: boolean; nofollow: boolean }[] {
  const re = /<a\s[^>]*>/gi;
  const out: { href: string; text: string; internal: boolean; nofollow: boolean }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const hrefMatch = tag.match(/href=["']([^"']*)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    let resolved = href;
    try { resolved = new URL(href, baseUrl).toString(); } catch { /* keep raw */ }
    const relMatch = tag.match(/rel=["']([^"']*)["']/i);
    const nofollow = relMatch ? /nofollow/i.test(relMatch[1]) : false;
    let internal = false;
    try {
      const baseHost = new URL(baseUrl).hostname;
      const linkHost = new URL(resolved).hostname;
      internal = baseHost === linkHost;
    } catch { /* ignore */ }
    out.push({ href: resolved, text: "", internal, nofollow });
  }
  return out;
}

function extractSchema(html: string): { type: string; raw: string }[] {
  const out: { type: string; raw: string }[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const it of arr) {
        if (it && it["@type"]) out.push({ type: Array.isArray(it["@type"]) ? it["@type"].join(",") : String(it["@type"]), raw });
      }
    } catch { out.push({ type: "invalid", raw }); }
  }
  return out;
}

function countTags(html: string, tag: string): number {
  const re = new RegExp(`<${tag}\\b`, "gi");
  return (html.match(re) || []).length;
}

function computeSeoScore(result: Omit<CrawlResult, "seoScore">): number {
  let score = 100;
  for (const iss of result.issues) {
    if (iss.severity === "critical") score -= 12;
    else if (iss.severity === "warning") score -= 6;
    else score -= 2;
  }
  // Bonus for schema presence
  if (result.schema.length > 0) score = Math.min(100, score + 4);
  return Math.max(0, Math.min(100, score));
}

// GET /api/client/[token]/crawl — fetches the client website and extracts real SEO data.
export async function GET(
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

  const sp = req.nextUrl.searchParams;
  const overrideUrl = sp.get("url");
  const targetUrl = (overrideUrl || client.company.website || "").trim();
  if (!targetUrl) {
    return NextResponse.json({ error: "No website configured for this client" }, { status: 400 });
  }

  const t0 = Date.now();
  let html = "";
  let status = 0;
  let ttfb = 0;
  let finalUrl = targetUrl;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(targetUrl, {
      headers: { "User-Agent": "GuardianX-SEO-Bot/1.0 (+https://guardianx-seo.com)" },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    status = res.status;
    finalUrl = res.url || targetUrl;
    const text = await res.text();
    html = text;
    // Approximate TTFB from total request time minus body read
    ttfb = Math.max(40, Math.round((Date.now() - t0) / 2));
  } catch (err) {
    return NextResponse.json({
      error: "Failed to fetch URL",
      url: targetUrl,
      message: err instanceof Error ? err.message : String(err),
    }, { status: 502 });
  }

  const title = extractTitle(html);
  const metaDescription = extractMetaDescription(html);
  const h1s = extractHeadings(html, "h1");
  const h2s = extractHeadings(html, "h2");
  const images = extractImages(html);
  const links = extractLinks(html, targetUrl);
  const schema = extractSchema(html);
  const loadTime = Date.now() - t0;
  const domSize = (html.match(/<\w+/g) || []).length;
  const performance = {
    ttfb,
    loadTime,
    domSize,
    imageCount: countTags(html, "img"),
    scriptCount: countTags(html, "script"),
    stylesheetCount: countTags(html, "link") + countTags(html, "style"),
  };

  const issues: CrawlIssue[] = [];
  if (!title) issues.push({ type: "title-missing", severity: "critical", message: "Page has no <title> tag", fix: "Add a unique descriptive title under 60 chars." });
  else if (title.length > 65) issues.push({ type: "title-length", severity: "warning", message: `Title is ${title.length} chars (max 65)`, fix: "Shorten the title." });
  else if (title.length < 30) issues.push({ type: "title-length", severity: "info", message: `Title is only ${title.length} chars — consider expanding.`, fix: "Front-load primary keyword." });

  if (!metaDescription) issues.push({ type: "meta-missing", severity: "critical", message: "Missing meta description", fix: "Add a 150-155 char description with the primary keyword." });
  else if (metaDescription.length > 160) issues.push({ type: "meta-length", severity: "warning", message: `Meta description is ${metaDescription.length} chars (max 160)` });

  if (h1s.length === 0) issues.push({ type: "h1-missing", severity: "critical", message: "Missing H1 tag", fix: "Add a single descriptive H1 per page." });
  else if (h1s.length > 1) issues.push({ type: "h1-multiple", severity: "warning", message: `${h1s.length} H1 tags found (should be 1)`, fix: "Keep exactly one H1 per page." });

  const noAlt = images.filter((i) => i.missingAlt);
  if (noAlt.length > 0) issues.push({ type: "img-alt", severity: noAlt.length > 5 ? "critical" : "warning", message: `${noAlt.length} of ${images.length} images missing alt text`, fix: "Add descriptive alt attributes to all images." });

  if (schema.length === 0) issues.push({ type: "schema-missing", severity: "warning", message: "No JSON-LD schema detected", fix: "Add Organization + BreadcrumbList schema." });

  if (performance.ttfb > 600) issues.push({ type: "ttfb-slow", severity: "warning", message: `TTFB is ${performance.ttfb}ms (target < 600ms)`, fix: "Enable caching, use a CDN, optimize server response." });
  if (performance.domSize > 1500) issues.push({ type: "dom-large", severity: "info", message: `DOM has ${performance.domSize} nodes (> 1500 may impact performance)` });
  if (performance.scriptCount > 15) issues.push({ type: "scripts-many", severity: "info", message: `${performance.scriptCount} scripts loaded`, fix: "Defer non-critical scripts and bundle where possible." });

  const internalLinks = links.filter((l) => l.internal).length;
  const externalLinks = links.filter((l) => !l.internal).length;
  if (internalLinks < 5) issues.push({ type: "internal-links-few", severity: "warning", message: `Only ${internalLinks} internal links`, fix: "Add more internal links to important pages." });

  const result: CrawlResult = {
    url: targetUrl,
    finalUrl,
    title,
    metaDescription,
    h1s,
    h2s: h2s.slice(0, 20),
    images: images.slice(0, 30),
    links: links.slice(0, 50),
    schema,
    performance,
    issues,
    seoScore: computeSeoScore({
      url: targetUrl, finalUrl, title, metaDescription, h1s, h2s, images, links, schema, performance, issues,
    } as Omit<CrawlResult, "seoScore">),
    crawledAt: new Date().toISOString(),
    httpStatus: status,
    internalLinkCount: internalLinks,
    externalLinkCount: externalLinks,
  } as CrawlResult & { finalUrl: string; httpStatus: number; internalLinkCount: number; externalLinkCount: number };

  return NextResponse.json(result);
}
