import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type PageCrawl = {
  url: string;
  title: string;
  metaDescription: string;
  h1s: string[];
  schemaTypes: string[];
  imageCount: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  loadTimeMs: number;
  seoScore: number;
  issues: { type: string; severity: "critical" | "warning" | "info"; message: string }[];
};

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : "";
}

function extractMetaDescription(html: string): string {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  return m ? m[1].trim() : "";
}

function extractH1s(html: string): string[] {
  const re = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1].replace(/<[^>]+>/g, "").trim());
  return out;
}

function extractSchemaTypes(html: string): string[] {
  const out: string[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const it of arr) if (it && it["@type"]) out.push(String(it["@type"]));
    } catch { /* skip */ }
  }
  return out;
}

function extractInternalLinks(html: string, baseHost: string): { internal: number; external: number; hrefs: string[] } {
  const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const hrefs: string[] = [];
  let internal = 0, external = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    hrefs.push(href);
    try {
      const u = new URL(href, `https://${baseHost}`);
      if (u.hostname === baseHost) internal++;
      else external++;
    } catch { /* ignore */ }
  }
  return { internal, external, hrefs };
}

function wordCountFromHtml(html: string): number {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

async function fetchPage(url: string): Promise<{ html: string; loadTimeMs: number; status: number }> {
  const t0 = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GuardianX-SEO-Bot/1.0 (+https://guardianx-seo.com)" },
      signal: controller.signal,
      redirect: "follow",
    });
    const html = await res.text();
    return { html, loadTimeMs: Date.now() - t0, status: res.status };
  } finally {
    clearTimeout(timeout);
  }
}

function scorePage(p: Omit<PageCrawl, "seoScore">): number {
  let s = 100;
  for (const i of p.issues) s -= i.severity === "critical" ? 12 : i.severity === "warning" ? 6 : 2;
  if (p.schemaTypes.length > 0) s = Math.min(100, s + 4);
  return Math.max(0, Math.min(100, s));
}

function buildIssuesFor(p: { title: string; metaDescription: string; h1s: string[]; schemaTypes: string[]; imageCount: number; imagesMissingAlt: number; loadTimeMs: number; wordCount: number }): PageCrawl["issues"] {
  const out: PageCrawl["issues"] = [];
  if (!p.title) out.push({ type: "title-missing", severity: "critical", message: "Missing <title>" });
  else if (p.title.length > 65) out.push({ type: "title-length", severity: "warning", message: `Title is ${p.title.length} chars` });
  if (!p.metaDescription) out.push({ type: "meta-missing", severity: "critical", message: "Missing meta description" });
  if (p.h1s.length === 0) out.push({ type: "h1-missing", severity: "critical", message: "Missing H1" });
  else if (p.h1s.length > 1) out.push({ type: "h1-multiple", severity: "warning", message: `${p.h1s.length} H1s` });
  if (p.schemaTypes.length === 0) out.push({ type: "schema-missing", severity: "warning", message: "No JSON-LD schema" });
  if (p.imagesMissingAlt > 0) out.push({ type: "img-alt", severity: p.imagesMissingAlt > 5 ? "critical" : "warning", message: `${p.imagesMissingAlt} images missing alt` });
  if (p.loadTimeMs > 3000) out.push({ type: "slow-page", severity: "warning", message: `Load time ${p.loadTimeMs}ms` });
  if (p.wordCount < 300) out.push({ type: "thin-content", severity: "info", message: `Only ${p.wordCount} words` });
  return out;
}

// GET /api/client/[token]/multicrawl — crawls homepage, discovers internal links, then crawls up to 15 pages.
export async function GET(
  _req: NextRequest,
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

  let baseUrl = (client.company.website || "").trim();
  if (baseUrl && !baseUrl.startsWith("http")) baseUrl = "https://" + baseUrl;
  if (!baseUrl) {
    return NextResponse.json({ error: "No website configured for this client" }, { status: 400 });
  }

  let baseHost = "";
  try { baseHost = new URL(baseUrl).hostname; } catch { /* ignore */ }
  if (!baseHost) return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });

  // 1. Crawl homepage
  let homeHtml = "";
  try {
    const r = await fetchPage(baseUrl);
    homeHtml = r.html;
  } catch (err) {
    return NextResponse.json({
      error: "Failed to fetch homepage",
      url: baseUrl,
      message: err instanceof Error ? err.message : String(err),
    }, { status: 502 });
  }

  const homeLinks = extractInternalLinks(homeHtml, baseHost);

  // 2. Discover internal URLs (dedupe + limit)
  const seen = new Set<string>([baseUrl]);
  const queue: string[] = [];
  for (const href of homeLinks.hrefs) {
    try {
      const u = new URL(href, baseUrl);
      if (u.hostname !== baseHost) continue;
      if (u.hash || u.search) continue;
      if (/\.(png|jpg|jpeg|gif|svg|pdf|zip|mp4|mp3|webp|woff2?|ttf|css|js)$/i.test(u.pathname)) continue;
      const canonical = u.toString().replace(/\/$/, "");
      if (!seen.has(canonical)) {
        seen.add(canonical);
        queue.push(canonical);
        if (queue.length >= 14) break;
      }
    } catch { /* skip */ }
  }

  // 3. Crawl each discovered page (cap at 15 total incl. homepage)
  const pages: PageCrawl[] = [];
  const homepage: PageCrawl = (() => {
    const title = extractTitle(homeHtml);
    const metaDescription = extractMetaDescription(homeHtml);
    const h1s = extractH1s(homeHtml);
    const schemaTypes = extractSchemaTypes(homeHtml);
    const imageCount = (homeHtml.match(/<img\b/gi) || []).length;
    const imagesMissingAlt = (homeHtml.match(/<img(?![^>]*\salt=)[^>]*>/gi) || []).length;
    const wordCount = wordCountFromHtml(homeHtml);
    const partial = {
      url: baseUrl, title, metaDescription, h1s,
      schemaTypes, imageCount,
      internalLinks: homeLinks.internal, externalLinks: homeLinks.external,
      wordCount, loadTimeMs: 0,
      issues: [] as PageCrawl["issues"],
    };
    partial.issues = buildIssuesFor({ title, metaDescription, h1s, schemaTypes, imageCount, imagesMissingAlt, loadTimeMs: 0, wordCount });
    return { ...partial, seoScore: scorePage(partial) };
  })();
  pages.push(homepage);

  // Sequential crawl (avoid overwhelming client site)
  for (const url of queue) {
    if (pages.length >= 15) break;
    try {
      const r = await fetchPage(url);
      const html = r.html;
      const title = extractTitle(html);
      const metaDescription = extractMetaDescription(html);
      const h1s = extractH1s(html);
      const schemaTypes = extractSchemaTypes(html);
      const imageCount = (html.match(/<img\b/gi) || []).length;
      const imagesMissingAlt = (html.match(/<img(?![^>]*\salt=)[^>]*>/gi) || []).length;
      const wordCount = wordCountFromHtml(html);
      const links = extractInternalLinks(html, baseHost);
      const partial = {
        url, title, metaDescription, h1s, schemaTypes, imageCount,
        internalLinks: links.internal, externalLinks: links.external,
        wordCount, loadTimeMs: r.loadTimeMs,
        issues: [] as PageCrawl["issues"],
      };
      partial.issues = buildIssuesFor({ title, metaDescription, h1s, schemaTypes, imageCount, imagesMissingAlt, loadTimeMs: r.loadTimeMs, wordCount });
      pages.push({ ...partial, seoScore: scorePage(partial) });
    } catch (err) {
      pages.push({
        url, title: "", metaDescription: "", h1s: [], schemaTypes: [], imageCount: 0,
        internalLinks: 0, externalLinks: 0, wordCount: 0, loadTimeMs: 0, seoScore: 0,
        issues: [{ type: "fetch-error", severity: "critical", message: err instanceof Error ? err.message : String(err) }],
      });
    }
  }

  // 4. Site-wide issues
  const siteWideIssues: Array<{ type: string; severity: "critical" | "warning" | "info"; message: string; affectedPages: string[] }> = [];

  const dupTitles = new Map<string, string[]>();
  for (const p of pages) {
    if (!p.title) continue;
    const arr = dupTitles.get(p.title) ?? [];
    arr.push(p.url);
    dupTitles.set(p.title, arr);
  }
  for (const [title, urls] of dupTitles.entries()) {
    if (urls.length > 1) {
      siteWideIssues.push({ type: "duplicate-title", severity: "warning", message: `Duplicate title: "${title}"`, affectedPages: urls });
    }
  }

  const dupDescriptions = new Map<string, string[]>();
  for (const p of pages) {
    if (!p.metaDescription) continue;
    const arr = dupDescriptions.get(p.metaDescription) ?? [];
    arr.push(p.url);
    dupDescriptions.set(p.metaDescription, arr);
  }
  for (const [desc, urls] of dupDescriptions.entries()) {
    if (urls.length > 1) {
      siteWideIssues.push({ type: "duplicate-meta", severity: "warning", message: `Duplicate meta description across ${urls.length} pages`, affectedPages: urls });
    }
  }

  const noSchema = pages.filter((p) => p.schemaTypes.length === 0 && p.title);
  if (noSchema.length > 0) {
    siteWideIssues.push({ type: "missing-schema", severity: "warning", message: `${noSchema.length} pages without JSON-LD schema`, affectedPages: noSchema.map((p) => p.url) });
  }

  const slowPages = pages.filter((p) => p.loadTimeMs > 3000);
  if (slowPages.length > 0) {
    siteWideIssues.push({ type: "slow-pages", severity: "warning", message: `${slowPages.length} pages slower than 3s`, affectedPages: slowPages.map((p) => p.url) });
  }

  const noH1 = pages.filter((p) => p.h1s.length === 0 && p.title);
  if (noH1.length > 0) {
    siteWideIssues.push({ type: "missing-h1", severity: "critical", message: `${noH1.length} pages without H1`, affectedPages: noH1.map((p) => p.url) });
  }

  const avgScore = pages.length > 0 ? Math.round((pages.reduce((s, p) => s + p.seoScore, 0) / pages.length) * 10) / 10 : 0;

  return NextResponse.json({
    baseUrl,
    crawledAt: new Date().toISOString(),
    pagesCrawled: pages.length,
    pagesDiscovered: queue.length + 1,
    pages,
    siteWideIssues,
    summary: {
      avgSeoScore: avgScore,
      totalPages: pages.length,
      pagesWithSchema: pages.filter((p) => p.schemaTypes.length > 0).length,
      pagesWithoutSchema: pages.filter((p) => p.schemaTypes.length === 0 && p.title).length,
      pagesWithIssues: pages.filter((p) => p.issues.length > 0).length,
      avgLoadMs: pages.length > 0 ? Math.round((pages.reduce((s, p) => s + p.loadTimeMs, 0) / pages.length) * 10) / 10 : 0,
      totalSiteWideIssues: siteWideIssues.length,
    },
  });
}
