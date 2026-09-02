"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFetch, formatNumber } from "@/lib/seo/hooks";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Copy, Check, Globe, Zap, Activity, Users, Clock,
  Smartphone, Monitor, MapPin, TrendingUp, MousePointerClick,
  ScrollText, Target, Shield, ArrowRight, ExternalLink,
  Bot, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IntegrationData = {
  client: { name: string; email: string; company: { name: string; website: string } };
  trackerUrl: string;
  embedScript: string;
  instructions: string[];
  capabilities: Array<{ title: string; desc: string }>;
};

type AnalyticsData = {
  totalEvents: number;
  totalPageviews: number;
  uniqueVisitors: number;
  avgDuration: number;
  dailyData: Array<{ date: string; pageviews: number; uniqueVisitors: number }>;
  topPages: Array<{ path: string; count: number }>;
  deviceSplit: Array<{ device: string; count: number }>;
  countrySplit: Array<{ country: string; count: number }>;
  recentEvents: Array<{ id: string; type: string; path: string; device: string | null; country: string | null; duration: number | null; createdAt: string }>;
};

export function IntegrationGuide({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"install" | "analytics" | "what-it-does">("install");
  const { toast } = useToast();

  const { data: integ, loading: integLoading } = useFetch<IntegrationData>(`/api/client/${token}/integration`);
  const { data: analytics, loading: analyticsLoading } = useFetch<AnalyticsData>(`/api/client/${token}/analytics?days=7`);

  const copyScript = () => {
    if (!integ?.embedScript) return;
    navigator.clipboard.writeText(integ.embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Embed script copied!", description: "Paste it into your website's <head>." });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {[
          { key: "install" as const, label: "Install", icon: Code2 },
          { key: "analytics" as const, label: "Live Analytics", icon: Activity },
          { key: "what-it-does" as const, label: "What It Does", icon: Zap },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all",
                tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === "install" && (
          <motion.div key="install" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  Add GuardianX-SEO to Your Website
                </CardTitle>
                <CardDescription>
                  Copy this script and paste it into your website&apos;s <code className="text-primary font-mono">&lt;head&gt;</code> section.
                  That&apos;s it — tracking starts immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {integLoading ? (
                  <div className="h-48 animate-pulse rounded-lg bg-muted" />
                ) : integ ? (
                  <div className="space-y-3">
                    {/* Embed code block */}
                    <div className="relative">
                      <pre className="max-h-72 overflow-auto rounded-xl border bg-muted/40 p-4 text-xs leading-relaxed font-mono rf-scroll">
                        <code>{integ.embedScript}</code>
                      </pre>
                      <Button
                        onClick={copyScript}
                        size="sm"
                        className="absolute top-3 right-3 gap-1.5"
                        variant={copied ? "default" : "outline"}
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-xl border bg-card p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                        Setup Steps
                      </div>
                      <ol className="space-y-2.5">
                        {integ.instructions.map((step, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Capabilities */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {integ.capabilities.map((cap, i) => (
                        <div key={i} className="rounded-lg border bg-muted/20 p-3">
                          <div className="text-sm font-medium">{cap.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cap.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* Quick test */}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Test the integration</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        After installing, visit your website and navigate a few pages. Then check the
                        <button onClick={() => setTab("analytics")} className="text-primary font-medium hover:underline mx-1">Live Analytics</button>
                        tab — you should see pageviews appear within seconds.
                      </p>
                    </div>

                    {/* Tracking URL */}
                    <div className="rounded-lg bg-muted/30 p-3 text-xs">
                      <span className="text-muted-foreground">Tracking endpoint: </span>
                      <code className="font-mono text-foreground break-all">{integ.trackerUrl}</code>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">Failed to load integration data.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {analyticsLoading ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading analytics…</CardContent></Card>
            ) : analytics && analytics.totalPageviews > 0 ? (
              <>
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <AnalyticsKpi icon={Activity} label="Pageviews (7d)" value={formatNumber(analytics.totalPageviews)} color="#10b981" />
                  <AnalyticsKpi icon={Users} label="Unique Visitors" value={formatNumber(analytics.uniqueVisitors)} color="#0ea5e9" />
                  <AnalyticsKpi icon={Clock} label="Avg Duration" value={analytics.avgDuration > 0 ? `${analytics.avgDuration}s` : "—"} color="#f59e0b" />
                  <AnalyticsKpi icon={Zap} label="Total Events" value={formatNumber(analytics.totalEvents)} color="#8b5cf6" />
                </div>

                {/* Daily chart */}
                {analytics.dailyData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Daily Traffic (7 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-1.5 h-32">
                        {analytics.dailyData.map((d, i) => {
                          const max = Math.max(...analytics.dailyData.map((x) => x.pageviews), 1);
                          const h = (d.pageviews / max) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                              <div className="text-[9px] font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">{d.pageviews}</div>
                              <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/60 to-teal-500 transition-all hover:from-emerald-500 hover:to-teal-600" style={{ height: `${h}%` }} />
                              <div className="text-[8px] text-muted-foreground">{new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Top pages */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-60 overflow-y-auto rf-scroll">
                        {analytics.topPages.map((p, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2 border-b last:border-b-0 hover:bg-muted/30">
                            <span className="font-mono text-xs truncate">{p.path}</span>
                            <Badge variant="secondary" className="tabular-nums">{p.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Device split */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Device Split</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.deviceSplit.map((d, i) => {
                          const total = analytics.deviceSplit.reduce((s, x) => s + x.count, 0);
                          const pct = Math.round((d.count / total) * 100);
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5">
                                  {d.device === "mobile" ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                                  <span className="capitalize">{d.device}</span>
                                </span>
                                <span className="font-semibold tabular-nums">{pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent events */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-72 overflow-y-auto rf-scroll">
                      {analytics.recentEvents.map((e) => (
                        <div key={e.id} className="flex items-center gap-3 px-4 py-2 border-b last:border-b-0 hover:bg-muted/30">
                          <span className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md text-xs",
                            e.type === "pageview" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            e.type === "scroll" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                            e.type === "conversion" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            !["pageview", "scroll", "conversion"].includes(e.type) && "bg-muted text-muted-foreground"
                          )}>
                            {e.type === "pageview" ? <Activity className="h-3.5 w-3.5" /> :
                             e.type === "scroll" ? <ScrollText className="h-3.5 w-3.5" /> :
                             <MousePointerClick className="h-3.5 w-3.5" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-xs truncate block">{e.path}</span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="capitalize">{e.type}</span>
                              {e.device && <span>· {e.device}</span>}
                              {e.country && <span>· {e.country}</span>}
                              {e.duration ? <span>· {e.duration}s</span> : null}
                              <span>· {new Date(e.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">No visitor data yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    Install the GuardianX-SEO tracking script on your website to start collecting
                    live visitor analytics. Check the <button onClick={() => setTab("install")} className="text-primary font-medium hover:underline">Install</button> tab.
                  </p>
                  <Button onClick={() => setTab("install")} className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5">
                    <Code2 className="h-4 w-4" />
                    Get the embed script
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {tab === "what-it-does" && (
          <motion.div key="what-it-does" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> What GuardianX-SEO Does for Your Website</CardTitle>
                <CardDescription>Once installed, GuardianX-SEO performs these actions to maximize your SEO reach:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SEO_ACTIONS.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow rf-lift"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${action.color}1a`, color: action.color }}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-3 font-semibold text-sm">{action.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* The SEO process */}
                <div className="mt-6 rounded-xl border bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">The GuardianX-SEO Process</div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      { step: "1. Track", desc: "Embed script collects visitor data" },
                      { step: "2. Analyze", desc: "AI analyzes traffic patterns & SERP data" },
                      { step: "3. Optimize", desc: "Action plan tells you exactly what to fix" },
                      { step: "4. Grow", desc: "Rankings climb, traffic increases" },
                    ].map((p, i) => (
                      <div key={i} className="text-center">
                        <div className="text-sm font-bold text-primary">{p.step}</div>
                        <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
                        {i < 3 && <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground/40 mx-auto mt-2" />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SEO_ACTIONS = [
  { icon: TrendingUp, color: "#10b981", title: "Track Keyword Rankings", desc: "Monitors your position for every target keyword daily, so you see exactly when you climb or drop in Google." },
  { icon: Zap, color: "#f59e0b", title: "Audit Technical SEO", desc: "Crawls your site for 600+ issues — broken links, missing schema, slow pages, mobile errors — and tells you how to fix each one." },
  { icon: Shield, color: "#0ea5e9", title: "Monitor Core Web Vitals", desc: "Measures LCP, FID, CLS & INP on every page so Google rewards you with better rankings for fast, stable UX." },
  { icon: Link2, color: "#8b5cf6", title: "Analyze Backlinks", desc: "Tracks every new and lost backlink, analyzes anchor text distribution, and identifies high-DA linking opportunities." },
  { icon: Bot, color: "#ec4899", title: "AI-Powered Recommendations", desc: "The LLM reads your data and writes specific, prioritized action items — not generic advice, but data-driven steps." },
  { icon: Target, color: "#14b8a6", title: "Find Content Gaps", desc: "Discovers keywords your competitors rank for that you don't, with opportunity scores so you know which to target first." },
  { icon: Globe, color: "#06b6d4", title: "Geo Rank Tracking", desc: "Tracks your SERP position by country so you know where to expand or localize content." },
  { icon: Activity, color: "#f43f5e", title: "Competitor Surveillance", desc: "Alerts you the moment a competitor gains a top-3 ranking, publishes new content, or captures a featured snippet." },
] as const;

function AnalyticsKpi({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string; color: string }) {
  return (
    <Card className="p-4 rf-glass-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1a`, color }}>{<Icon className="h-4 w-4" />}</span>
      </div>
      <div className="mt-1.5 text-2xl font-bold tabular-nums">{value}</div>
    </Card>
  );
}
