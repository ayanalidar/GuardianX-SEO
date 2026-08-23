import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/pagespeed — fetches REAL data from Google PageSpeed Insights API.
// ?strategy=mobile (default) | desktop
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

  const targetUrl = (client.company.website || "").trim();
  if (!targetUrl) {
    return NextResponse.json({ error: "No website configured for this client" }, { status: 400 });
  }

  const strategy = req.nextUrl.searchParams.get("strategy") === "desktop" ? "desktop" : "mobile";
  const apiKey = process.env.PAGESPEED_API_KEY || "";
  const psiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  psiUrl.searchParams.set("url", targetUrl);
  psiUrl.searchParams.set("strategy", strategy);
  // Request all category scores
  ["performance", "accessibility", "best-practices", "seo"].forEach((c) => psiUrl.searchParams.append("category", c));
  if (apiKey) psiUrl.searchParams.set("key", apiKey);

  let psiJson: any = null;
  let psiStatus = 0;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const res = await fetch(psiUrl.toString(), {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    psiStatus = res.status;
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({
        error: "PageSpeed Insights API returned an error",
        status: psiStatus,
        url: targetUrl,
        strategy,
        details: txt.slice(0, 800),
      }, { status: 502 });
    }
    psiJson = await res.json();
  } catch (err) {
    return NextResponse.json({
      error: "Failed to reach Google PageSpeed Insights API",
      url: targetUrl,
      strategy,
      message: err instanceof Error ? err.message : String(err),
    }, { status: 504 });
  }

  const cats = psiJson?.lighthouseResult?.categories ?? {};
  const audits = psiJson?.lighthouseResult?.audits ?? {};
  const scoreOf = (cat: any) => (cat?.score != null ? Math.round(cat.score * 100) : 0);

  const performance = scoreOf(cats.performance);
  const seo = scoreOf(cats.seo);
  const accessibility = scoreOf(cats.accessibility);
  const bestPractices = scoreOf(cats["best-practices"]);

  // Core Web Vitals
  const cwv = {
    lcp: audits?.["largest-contentful-paint"]?.numericValue ?? null,
    lcpScore: audits?.["largest-contentful-paint"]?.score ?? null,
    fid: audits?.["max-potential-fid"]?.numericValue ?? null,
    cls: audits?.["cumulative-layout-shift"]?.numericValue ?? null,
    clsScore: audits?.["cumulative-layout-shift"]?.score ?? null,
    tbt: audits?.["total-blocking-time"]?.numericValue ?? null,
    tbtScore: audits?.["total-blocking-time"]?.score ?? null,
    fcp: audits?.["first-contentful-paint"]?.numericValue ?? null,
    fcpScore: audits?.["first-contentful-paint"]?.score ?? null,
    si: audits?.["speed-index"]?.numericValue ?? null,
    tti: audits?.["interactive"]?.numericValue ?? null,
  };

  // Optimization opportunities
  const opportunities: Array<{ id: string; title: string; savingsMs: number; description: string }> = [];
  const oppRefs = psiJson?.lighthouseResult?.categories?.performance?.auditRefs ?? [];
  for (const ref of oppRefs) {
    if (ref.weight && ref.weight > 0) {
      const a = audits?.[ref.id];
      if (a && typeof a.numericValue === "number" && a.score != null && a.score < 0.9) {
        const savings = a.numericValue;
        opportunities.push({
          id: ref.id,
          title: a.title || ref.id,
          savingsMs: Math.round(savings),
          description: a.description || "",
        });
      }
    }
  }
  opportunities.sort((a, b) => b.savingsMs - a.savingsMs);

  // Diagnostics (non-scoring)
  const diagnostics: Array<{ id: string; title: string; value: string; description: string }> = [];
  const diagIds = ["dom-size", "total-byte-weight", "uses-long-cache-ttl", "render-blocking-resources", "unminified-javascript", "unminified-css", "unused-css-rules", "unused-javascript", "modern-image-formats", "uses-optimized-images", "uses-text-compression", "uses-responsive-images"];
  for (const id of diagIds) {
    const a = audits?.[id];
    if (a) {
      const value = a.numericValue != null ? `${Math.round(a.numericValue)}${a.numericUnit || ""}` : a.displayValue || "—";
      diagnostics.push({ id, title: a.title || id, value, description: a.description || "" });
    }
  }

  // Persist Core Web Vitals into the database for trend tracking
  try {
    await db.coreWebVital.create({
      data: {
        companyId: client.companyId,
        url: targetUrl,
        device: strategy,
        lcp: cwv.lcp ? Math.round(cwv.lcp) / 1000 : 0,       // sec
        fid: cwv.fid ?? 0,                                    // ms
        cls: cwv.cls ?? 0,
        inp: cwv.tbt ?? 0,                                    // proxy via TBT
        ttfb: audits?.["server-response-time"]?.numericValue ?? 0,
        fcp: cwv.fcp ? cwv.fcp / 1000 : 0,                    // sec
        score: performance,
        status: performance >= 90 ? "good" : performance >= 50 ? "needs-improvement" : "poor",
      },
    });
  } catch { /* ignore persistence errors */ }

  return NextResponse.json({
    url: targetUrl,
    strategy,
    fetchedAt: new Date().toISOString(),
    scores: { performance, seo, accessibility, bestPractices },
    coreWebVitals: {
      lcp: cwv.lcp ? Math.round(cwv.lcp) / 1000 : null,         // sec
      lcpScore: cwv.lcpScore,
      fid: cwv.fid,                                              // ms
      cls: cwv.cls,
      clsScore: cwv.clsScore,
      tbt: cwv.tbt,                                              // ms
      tbtScore: cwv.tbtScore,
      fcp: cwv.fcp ? cwv.fcp / 1000 : null,                      // sec
      fcpScore: cwv.fcpScore,
      si: cwv.si ? cwv.si / 1000 : null,
      tti: cwv.tti ? cwv.tti / 1000 : null,
    },
    opportunities: opportunities.slice(0, 12),
    diagnostics,
    finalUrl: psiJson?.lighthouseResult?.finalUrl ?? targetUrl,
    httpStatus: psiStatus,
    source: "google-pagespeed-insights-v5",
  });
}
