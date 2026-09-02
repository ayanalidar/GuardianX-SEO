"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Layers, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type PageResult = {
  path: string;
  url: string;
  error?: string;
  status?: number;
  loadTime?: number;
  title?: string;
  titleLength?: number;
  metaDesc?: string;
  metaDescLength?: number;
  h1Count?: number;
  h2Count?: number;
  wordCount?: number;
  imgCount?: number;
  imgNoAlt?: number;
  hasSchema?: boolean;
  hasViewport?: boolean;
  score: number;
  issues: Array<{ severity: string; title: string }>;
};

type MultiCrawlData = {
  pages: PageResult[];
  pageCount: number;
  avgScore: number;
  bestPage: { path: string; score: number };
  worstPage: { path: string; score: number };
  siteWideIssues: Array<{ severity: string; title: string; detail: string }>;
  duplicateTitles: Array<[string, number]>;
  duplicateMetaDescs: Array<[string, number]>;
  crawledAt: string;
};

const severityColors: Record<string, string> = {
  critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export function MultiPageCrawler({ token }: { token: string }) {
  const [data, setData] = useState<MultiCrawlData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const crawl = async () => {
    setLoading(true);
    setData(null);
    try {
      const r = await fetch(`/api/client/${token}/multicrawl`);
      const j = await r.json();
      setData(j);
      toast({ title: "Multi-page crawl complete!", description: `${j.pageCount} pages crawled` });
    } catch {
      toast({ title: "Crawl failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Multi-Page Site Crawler
            </CardTitle>
            <CardDescription>Crawls up to 15 pages of your site &amp; compares them page-by-page</CardDescription>
          </div>
          <Button onClick={crawl} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            {loading ? "Crawling…" : data ? "Re-crawl all pages" : "Crawl all pages"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!data && !loading && (
          <div className="py-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium">No multi-page crawl yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Click <strong>Crawl all pages</strong> — GuardianX-SEO will fetch up to 15 pages of your site, find site-wide issues like duplicate titles, and compare page-by-page SEO scores.
            </p>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Crawling up to 15 pages of your site…</p>
          </div>
        )}

        <AnimatePresence>
          {data && !loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border bg-card p-3 text-center">
                  <div className="text-2xl font-bold tabular-nums">{data.pageCount}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Pages Crawled</div>
                </div>
                <div className="rounded-xl border bg-card p-3 text-center">
                  <div className={cn("text-2xl font-bold tabular-nums", data.avgScore >= 75 ? "text-emerald-600 dark:text-emerald-400" : data.avgScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>{data.avgScore}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Score</div>
                </div>
                <div className="rounded-xl border bg-card p-3 text-center">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">{data.bestPage.path}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Best Page ({data.bestPage.score})</div>
                </div>
                <div className="rounded-xl border bg-card p-3 text-center">
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400 truncate">{data.worstPage.path}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Worst Page ({data.worstPage.score})</div>
                </div>
              </div>

              {/* Site-wide issues */}
              {data.siteWideIssues.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 rf-section-heading">Site-Wide Issues</div>
                  <div className="space-y-2">
                    {data.siteWideIssues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg border bg-card p-2.5">
                        <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5", issue.severity === "warning" ? "text-amber-500" : "text-sky-500")} />
                        <div>
                          <div className="text-sm font-medium">{issue.title}</div>
                          <div className="text-xs text-muted-foreground">{issue.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Page-by-page table */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 rf-section-heading">Page-by-Page Breakdown</div>
                <div className="overflow-x-auto rf-scroll">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 pr-3 font-semibold text-muted-foreground">Path</th>
                        <th className="px-2 py-2 font-semibold text-muted-foreground text-center">Score</th>
                        <th className="px-2 py-2 font-semibold text-muted-foreground text-center">Status</th>
                        <th className="px-2 py-2 font-semibold text-muted-foreground text-center">Load</th>
                        <th className="px-2 py-2 font-semibold text-muted-foreground text-center">Words</th>
                        <th className="px-2 py-2 font-semibold text-muted-foreground text-center">H1</th>
                        <th className="px-2 py-2 font-semibold text-muted-foreground text-center">Schema</th>
                        <th className="pl-2 py-2 font-semibold text-muted-foreground">Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map((page, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="py-2 pr-3 font-mono text-[11px] truncate max-w-[120px]">{page.path}</td>
                          <td className="px-2 py-2 text-center">
                            <span className={cn("inline-flex min-w-7 justify-center rounded px-1.5 py-0.5 font-bold tabular-nums",
                              page.score >= 75 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
                              page.score >= 50 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                              "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                            )}>{page.score}</span>
                          </td>
                          <td className="px-2 py-2 text-center tabular-nums">{page.status ?? "—"}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{page.loadTime ? `${page.loadTime}ms` : "—"}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{page.wordCount ?? "—"}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{page.h1Count ?? "—"}</td>
                          <td className="px-2 py-2 text-center">{page.hasSchema ? "✓" : "✗"}</td>
                          <td className="pl-2 py-2 text-muted-foreground truncate max-w-[160px]" title={page.title}>{page.title}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
