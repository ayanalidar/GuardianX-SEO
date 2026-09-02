"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Info, Zap, Code2, Link2, Image as ImageIcon, FileCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type CrawlData = {
  url: string;
  status: number;
  loadTime: number;
  redirected: boolean;
  finalUrl: string;
  htmlSize: number;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  ogTags: { ogTitle: string | null; ogDescription: string | null; ogImage: string | null; viewport: string | null };
  headings: { h1: string[]; h2: string[]; h3: string[] };
  images: { total: number; missingAlt: number };
  links: { internalCount: number; externalCount: number; internal: string[]; external: string[] };
  schema: { count: number; types: string[] };
  performance: { loadTime: number; inlineStyles: number; inlineScripts: number; scriptSrcs: string[] };
  wordCount: number;
  issues: Array<{ severity: string; title: string; detail: string }>;
  realScore: number;
  robotsTxt: { found: boolean };
  sitemap: { found: boolean; urlCount?: number };
  crawledAt: string;
  error?: string;
};

const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; label: string }> = {
  critical: { icon: AlertCircle, color: "#ef4444", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", label: "Critical" },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Warning" },
  info: { icon: Info, color: "#0ea5e9", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400", label: "Info" },
};

export function LiveSiteAudit({ token }: { token: string }) {
  const [data, setData] = useState<CrawlData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const crawl = async () => {
    setLoading(true);
    setData(null);
    try {
      const r = await fetch(`/api/client/${token}/crawl`);
      const j = await r.json();
      setData(j);
      if (j.error) {
        toast({ title: "Crawl issue", description: j.error, variant: "destructive" });
      } else {
        toast({ title: "Live audit complete!", description: `${j.issues?.length || 0} issues found on your real site.` });
      }
    } catch (e) {
      toast({ title: "Crawl failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const critical = data?.issues.filter((i) => i.severity === "critical") ?? [];
  const warnings = data?.issues.filter((i) => i.severity === "warning") ?? [];
  const infos = data?.issues.filter((i) => i.severity === "info") ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Live Site Audit
            </CardTitle>
            <CardDescription>Actually crawls your real website and extracts live SEO data — not estimates</CardDescription>
          </div>
          <Button onClick={crawl} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Crawling…" : data ? "Re-crawl site" : "Crawl my site now"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!data && !loading && (
          <div className="py-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium">No live audit yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Click <strong>Crawl my site now</strong> — GuardianX-SEO will fetch your actual website and extract real title tags, meta descriptions, headings, schema, broken links, and performance data.
            </p>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Fetching your website & analyzing SEO…</p>
          </div>
        )}

        <AnimatePresence>
          {data && !loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {data.error ? (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-semibold text-sm">Couldn&apos;t crawl {data.url}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{data.error}</p>
                  <p className="text-xs text-muted-foreground mt-2">This usually means the site blocks bots, is behind a login, or the URL is incorrect. The rest of your dashboard still works.</p>
                </div>
              ) : (
                <>
                  {/* Real SEO score + stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <div className={cn("text-3xl font-bold tabular-nums", data.realScore >= 75 ? "text-emerald-600 dark:text-emerald-400" : data.realScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>
                        {data.realScore}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">Real SEO Score</div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <div className="text-3xl font-bold tabular-nums">{data.status}</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">HTTP Status</div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <div className="text-3xl font-bold tabular-nums">{data.loadTime}ms</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">Load Time</div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <div className="text-3xl font-bold tabular-nums">{data.wordCount}</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">Words</div>
                    </div>
                  </div>

                  {/* Issues */}
                  {data.issues.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 rf-section-heading">
                        {data.issues.length} Issues Found on Your Real Site
                      </div>
                      <div className="space-y-2">
                        {data.issues.map((issue, i) => {
                          const cfg = severityConfig[issue.severity] ?? severityConfig.info;
                          const Icon = cfg.icon;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow"
                            >
                              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{issue.title}</span>
                                  <Badge variant="outline" className={cn("text-[9px] capitalize", cfg.bg)}>{issue.severity}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{issue.detail}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {data.issues.length === 0 && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">No issues found! Your on-page SEO looks great.</p>
                    </div>
                  )}

                  {/* Extracted data */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DataBlock icon={Code2} label="Title Tag" value={data.title} maxLen={60} />
                    <DataBlock icon={Code2} label="Meta Description" value={data.metaDescription} maxLen={160} />
                    <DataBlock icon={Link2} label="Canonical URL" value={data.canonical} />
                    <DataBlock icon={FileCode} label="H1 Tags" value={data.headings.h1.length > 0 ? data.headings.h1.join(" · ") : "None found"} bad={data.headings.h1.length === 0} />
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <SummaryStat icon={ImageIcon} label="Images" value={`${data.images.total}`} sub={`${data.images.missingAlt} missing alt`} bad={data.images.missingAlt > 0} />
                    <SummaryStat icon={Link2} label="Internal Links" value={String(data.links.internalCount)} />
                    <SummaryStat icon={Link2} label="External Links" value={String(data.links.externalCount)} />
                    <SummaryStat icon={FileCode} label="Schema" value={String(data.schema.count)} sub={data.schema.types.join(", ") || "none"} />
                    <SummaryStat icon={Code2} label="Inline Styles" value={String(data.performance.inlineStyles)} />
                    <SummaryStat icon={Code2} label="Inline Scripts" value={String(data.performance.inlineScripts)} bad={data.performance.inlineScripts > 15} />
                    <SummaryStat icon={Globe} label="robots.txt" value={data.robotsTxt.found ? "Found" : "Missing"} bad={!data.robotsTxt.found} />
                    <SummaryStat icon={Globe} label="sitemap.xml" value={data.sitemap.found ? `${data.sitemap.urlCount || 0} URLs` : "Missing"} bad={!data.sitemap.found} />
                  </div>

                  <div className="text-[10px] text-muted-foreground text-center">
                    Crawled at {new Date(data.crawledAt).toLocaleString()} · URL: {data.finalUrl || data.url}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function DataBlock({ icon: Icon, label, value, maxLen, bad }: { icon: typeof Code2; label: string; value: string | null; maxLen?: number; bad?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-card p-3", bad && "border-rose-500/30")}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={cn("text-xs mt-1 font-mono leading-relaxed", bad && "text-rose-600 dark:text-rose-400")}>
        {value ? (
          <>
            {value.slice(0, maxLen || 200)}
            {value.length > (maxLen || 200) ? "…" : ""}
            {maxLen && value.length > maxLen && (
              <span className="text-rose-500 ml-1">({value.length} chars)</span>
            )}
          </>
        ) : (
          <span className="text-rose-500">Not found</span>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value, sub, bad }: { icon: typeof Code2; label: string; value: string; sub?: string; bad?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-card p-3", bad && "border-amber-500/30")}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={cn("text-lg font-bold tabular-nums mt-0.5", bad && "text-amber-600 dark:text-amber-400")}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground truncate">{sub}</div>}
    </div>
  );
}
