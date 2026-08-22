"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeywordTrendSparkline, BacklinkTypeChart, CwvGauge } from "./charts";
import { IssueFixButton } from "./features/issue-fix-button";
import {
  CompanyDetail, Keyword, Backlink, Competitor,
  TechnicalIssue, ContentGap, SeoInsight, CoreWebVital, SerpFeature,
} from "@/lib/seo/types";
import { formatNumber, formatMoney } from "@/lib/seo/hooks";
import {
  ArrowUpDown, ExternalLink, ArrowUp, ArrowDown, Minus,
  Link2, Shield, AlertTriangle, AlertCircle, Info,
  Lightbulb, Sparkles, Loader2, Bot, Target, TrendingUp,
  Gauge, Smartphone, Monitor, Zap, Clock, Layout, MousePointerClick,
  Search, FileDown, Trash2, Star, Video, Image, MapPin,
  Newspaper, HelpCircle, Link as LinkIcon, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFetch } from "@/lib/seo/hooks";
import { useToast } from "@/hooks/use-toast";

// ---------- Keyword Table ----------
const intentColors: Record<string, string> = {
  commercial: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  informational: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  transactional: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  navigational: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function KeywordTable({ keywords, companyId }: { keywords: Keyword[]; companyId: string }) {
  const { toast } = useToast();
  const exportCsv = () => {
    window.open(`/api/export?companyId=${companyId}&type=keywords`, "_blank");
    toast({ title: "Export started", description: "Downloading keywords CSV…" });
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>Keyword Rank Tracking</CardTitle>
            <CardDescription>
              {keywords.length} tracked keywords · live position with 14-day trend
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
            <FileDown className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[520px] overflow-y-auto rf-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[40%]">Keyword</TableHead>
                <TableHead className="text-center">Pos</TableHead>
                <TableHead className="text-center">Change</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-center">Difficulty</TableHead>
                <TableHead className="text-center">Intent</TableHead>
                <TableHead className="text-right">CPC</TableHead>
                <TableHead className="w-[90px] text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((k) => {
                const change = k.previousPosition - k.position;
                const up = change > 0;
                const down = change < 0;
                return (
                  <TableRow key={k.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{k.keyword}</span>
                        <a
                          href={k.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-8 justify-center rounded-md px-2 py-0.5 text-sm font-bold tabular-nums",
                          k.position <= 3 && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                          k.position > 3 && k.position <= 10 && "bg-teal-500/15 text-teal-700 dark:text-teal-300",
                          k.position > 10 && k.position <= 20 && "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
                          k.position > 20 && "bg-muted text-muted-foreground"
                        )}
                      >
                        #{k.position}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {change === 0 ? (
                        <span className="inline-flex items-center text-muted-foreground text-xs">
                          <Minus className="h-3 w-3" />
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 text-xs font-semibold",
                            up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(change)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatNumber(k.searchVolume)}
                    </TableCell>
                    <TableCell className="text-center">
                      <DifficultyBar value={k.difficulty} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px] font-medium capitalize", intentColors[k.intent])}
                      >
                        {k.intent}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatMoney(k.cpc)}
                    </TableCell>
                    <TableCell>
                      <KeywordTrendSparkline trend={k.trend} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyBar({ value }: { value: number }) {
  const color =
    value < 30 ? "#10b981" : value < 50 ? "#f59e0b" : value < 70 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-6">{value.toFixed(0)}</span>
    </div>
  );
}

// ---------- Backlinks Panel ----------
export function BacklinksPanel({ detail }: { detail: CompanyDetail }) {
  const { backlinks, backlinkStats, company } = detail;
  const { toast } = useToast();
  const dofollowPct = backlinkStats.total > 0
    ? Math.round((backlinkStats.dofollow / backlinkStats.total) * 100)
    : 0;
  const exportCsv = () => {
    window.open(`/api/export?companyId=${company.id}&type=backlinks`, "_blank");
    toast({ title: "Export started", description: "Downloading backlinks CSV…" });
  };
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Link Profile
          </CardTitle>
          <CardDescription>Dofollow vs nofollow distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <BacklinkTypeChart dofollow={backlinkStats.dofollow} nofollow={backlinkStats.nofollow} />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="rounded-lg border p-2">
              <div className="text-[10px] uppercase text-muted-foreground">New</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{backlinkStats.newLinks}</div>
            </div>
            <div className="rounded-lg border p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Active</div>
              <div className="text-lg font-bold">{backlinkStats.activeLinks}</div>
            </div>
            <div className="rounded-lg border p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Lost</div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{backlinkStats.lostLinks}</div>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dofollow ratio</span>
              <span className="font-bold tabular-nums">{dofollowPct}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Top Referring Domains</CardTitle>
              <CardDescription>High-authority backlinks sorted by DA</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
              <FileDown className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[440px] overflow-y-auto rf-scroll">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Anchor</TableHead>
                  <TableHead className="text-center">DA</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Traffic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backlinks.map((b) => (
                  <BacklinkRow key={b.id} b={b} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BacklinkRow({ b }: { b: Backlink }) {
  const statusColor =
    b.status === "new"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : b.status === "lost"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      : "bg-muted text-muted-foreground";
  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell>
        <div className="font-medium text-sm truncate max-w-[180px]">{b.sourceDomain}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{b.sourceUrl}</div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">{b.anchorText}</TableCell>
      <TableCell className="text-center">
        <span className="inline-flex min-w-8 justify-center rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 text-xs font-bold tabular-nums">
          {b.domainAuthority.toFixed(0)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={b.linkType === "dofollow" ? "text-emerald-600 border-emerald-500/30" : "text-muted-foreground"}>
          {b.linkType}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="secondary" className={cn("capitalize text-[10px]", statusColor)}>{b.status}</Badge>
      </TableCell>
      <TableCell className="text-right text-sm tabular-nums">{formatNumber(b.traffic)}</TableCell>
    </TableRow>
  );
}

// ---------- Competitors Panel ----------
export function CompetitorsPanel({ competitors, companyName }: { competitors: Competitor[]; companyName: string }) {
  const maxTraffic = Math.max(...competitors.map((c) => c.organicTraffic), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Competitor Analysis
        </CardTitle>
        <CardDescription>
          Comparing {companyName} against {competitors.length} top competitors
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[520px] overflow-y-auto rf-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Competitor</TableHead>
                <TableHead className="text-center">DA</TableHead>
                <TableHead className="text-right">Organic Traffic</TableHead>
                <TableHead className="text-center">Common KW</TableHead>
                <TableHead className="text-center">Overlap</TableHead>
                <TableHead className="text-right">Backlinks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.domain}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex min-w-8 justify-center rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 text-xs font-bold tabular-nums">
                      {c.domainAuthority.toFixed(0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold tabular-nums">{formatNumber(c.organicTraffic)}</div>
                    <div className="mt-1 h-1.5 w-24 ml-auto rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(c.organicTraffic / maxTraffic) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm">{formatNumber(c.commonKeywords)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${c.trafficOverlap * 100}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-9">{Math.round(c.trafficOverlap * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{formatNumber(c.backlinks)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Technical Issues Panel ----------
const severityConfig: Record<string, { icon: typeof Shield; color: string; bg: string; label: string }> = {
  critical: { icon: AlertTriangle, color: "#ef4444", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", label: "Critical" },
  warning: { icon: AlertCircle, color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Warning" },
  info: { icon: Info, color: "#0ea5e9", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400", label: "Info" },
};

const typeIcons: Record<string, string> = {
  "core-web-vitals": "⚡",
  crawlability: "🕷️",
  mobile: "📱",
  schema: "🏷️",
  security: "🔒",
  indexability: "🔍",
};

export function TechnicalIssuesPanel({ issues, stats, companyId }: { issues: TechnicalIssue[]; stats: CompanyDetail["issueStats"]; companyId: string }) {
  const open = issues.filter((i) => i.status === "open");
  return (
    <div className="space-y-4">
      {/* Severity summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SeverityCard label="Critical" count={stats.critical} config={severityConfig.critical} />
        <SeverityCard label="Warnings" count={stats.warning} config={severityConfig.warning} />
        <SeverityCard label="Info" count={stats.info} config={severityConfig.info} />
        <SeverityCard label="Resolved" count={stats.resolved} config={{ icon: Shield, color: "#10b981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Resolved" }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Technical SEO Audit
          </CardTitle>
          <CardDescription>{open.length} open issues across {new Set(issues.map((i) => i.type)).size} categories · click "Get AI Fix" for LLM-powered recommendations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto rf-scroll divide-y">
            {issues.map((issue) => {
              const cfg = severityConfig[issue.severity] ?? severityConfig.info;
              const Icon = cfg.icon;
              return (
                <div key={issue.id} className="hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-lg shrink-0" title={issue.type}>{typeIcons[issue.type] ?? "🔧"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{issue.title}</span>
                        <Badge variant="secondary" className={cn("text-[10px] font-medium gap-0.5", cfg.bg)}>
                          <Icon className="h-2.5 w-2.5" />
                          {cfg.label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", issue.status === "open" ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600")}>
                          {issue.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{issue.description}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{issue.affectedCount} pages affected · {issue.type}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Affected</div>
                      <div className="text-lg font-bold tabular-nums">{issue.affectedCount}</div>
                    </div>
                  </div>
                  <IssueFixButton issue={issue} companyId={companyId} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SeverityCard({
  label, count, config,
}: {
  label: string;
  count: number;
  config: { icon: typeof Shield; color: string; bg: string; label: string };
}) {
  const Icon = config.icon;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", config.bg)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-2xl font-bold tabular-nums">{count}</span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground font-medium">{label}</div>
    </Card>
  );
}

// ---------- Content Gaps Panel ----------
export function ContentGapsPanel({ gaps }: { gaps: ContentGap[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Content Gap Opportunities
        </CardTitle>
        <CardDescription>
          {gaps.length} keywords competitors rank for that you don&apos;t — sorted by opportunity
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[520px] overflow-y-auto rf-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Competitors Ranking</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-center">Difficulty</TableHead>
                <TableHead className="w-[140px]">Opportunity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gaps.map((g) => (
                <TableRow key={g.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{g.keyword}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{g.competitorRanking}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(g.searchVolume)}</TableCell>
                  <TableCell className="text-center">
                    <DifficultyBar value={g.difficulty} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={g.opportunity} className="h-2" />
                      <span className="text-xs font-bold tabular-nums w-8 text-right">{g.opportunity}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- AI Insights Panel ----------
export function AiInsightsPanel({ companyId }: { companyId: string }) {
  const { data, loading, error } = useFetch<{ insights: SeoInsight[] }>(
    `/api/companies/${companyId}`
  );
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [localInsights, setLocalInsights] = useState<SeoInsight[] | null>(null);
  const { toast } = useToast();

  const insights = localInsights ?? data?.insights ?? [];

  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const r = await fetch(`/api/companies/${companyId}/insights`, {
        method: "POST",
      });
      if (!r.ok) throw new Error("Generation failed");
      const j = await r.json();
      setLocalInsights(j.insights);
      toast({
        title: "Insights generated",
        description: `${j.insights.length} AI recommendations ready.`,
      });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const clearInsights = async () => {
    try {
      const r = await fetch(`/api/companies/${companyId}/insights/clear`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Clear failed");
      setLocalInsights([]);
      toast({
        title: "Insights cleared",
        description: "All AI insights removed for this company.",
      });
    } catch (e) {
      toast({
        title: "Clear failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const typeConfig: Record<string, { icon: typeof Sparkles; color: string; bg: string }> = {
    opportunity: { icon: TrendingUp, color: "#10b981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    warning: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    action: { icon: Target, color: "#0ea5e9", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    competitive: { icon: Shield, color: "#8b5cf6", bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  };

  const priorityColor: Record<string, string> = {
    high: "border-l-rose-500",
    medium: "border-l-amber-500",
    low: "border-l-sky-500",
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="relative rf-hero-glow">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                    <Bot className="h-4 w-4" />
                  </span>
                  AI-Powered SEO Insights
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Get data-driven recommendations generated by RankForge AI
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {insights.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearInsights}
                    disabled={generating}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
                <Button onClick={generate} disabled={generating} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90">
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing…
                    </>
                  ) : insights.length > 0 ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Insights
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {genError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-600 dark:text-rose-400 mb-4">
                {genError}
              </div>
            )}
            {insights.length === 0 && !generating ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No insights yet. Click <strong>Generate Insights</strong> to analyze this company&apos;s SEO with AI.
                </p>
              </div>
            ) : generating && insights.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                Analyzing SEO profile & generating recommendations…
              </div>
            ) : (
              <div className="grid gap-3">
                {insights.map((ins) => {
                  const cfg = typeConfig[ins.type] ?? typeConfig.action;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={ins.id}
                      className={cn(
                        "rounded-lg border border-l-4 p-4 bg-card hover:shadow-sm transition-shadow",
                        priorityColor[ins.priority]
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0", cfg.bg)}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm leading-snug">{ins.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{ins.content}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize text-[10px] shrink-0">
                          {ins.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

// ---------- Core Web Vitals Panel ----------
const cwvMetricConfig: Record<
  string,
  { label: string; icon: typeof Gauge; unit: string; goodMax: number; needsMax: number }
> = {
  lcp: { label: "LCP", icon: Zap, unit: "s", goodMax: 2.5, needsMax: 4.0 },
  fid: { label: "FID", icon: Clock, unit: "ms", goodMax: 100, needsMax: 300 },
  cls: { label: "CLS", icon: Layout, unit: "", goodMax: 0.1, needsMax: 0.25 },
  inp: { label: "INP", icon: MousePointerClick, unit: "ms", goodMax: 200, needsMax: 500 },
  ttfb: { label: "TTFB", icon: Clock, unit: "ms", goodMax: 800, needsMax: 1800 },
  fcp: { label: "FCP", icon: Zap, unit: "s", goodMax: 1.8, needsMax: 3.0 },
};

function cwvStatus(value: number, key: string): "good" | "needs-improvement" | "poor" {
  const cfg = cwvMetricConfig[key];
  if (!cfg) return "needs-improvement";
  if (value <= cfg.goodMax) return "good";
  if (value <= cfg.needsMax) return "needs-improvement";
  return "poor";
}

const cwvStatusColor: Record<string, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  "needs-improvement": "text-amber-600 dark:text-amber-400",
  poor: "text-rose-600 dark:text-rose-400",
};
const cwvStatusBg: Record<string, string> = {
  good: "bg-emerald-500/10",
  "needs-improvement": "bg-amber-500/10",
  poor: "bg-rose-500/10",
};

export function CoreWebVitalsPanel({ detail }: { detail: CompanyDetail }) {
  const { webVitals, cwvSummary } = detail;
  const mobile = webVitals.filter((w) => w.device === "mobile");
  const desktop = webVitals.filter((w) => w.device === "desktop");

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-muted-foreground font-medium">Avg CWV Score</span>
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-1.5 text-2xl font-bold tabular-nums">{cwvSummary.avgScore}</div>
        </Card>
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-emerald-700 dark:text-emerald-400 font-medium">Good</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">{cwvSummary.good}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">URLs passing</div>
        </Card>
        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-amber-700 dark:text-amber-400 font-medium">Needs Work</span>
            <span className="text-amber-600 dark:text-amber-400 text-lg font-bold">{cwvSummary.needsImprovement}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">URLs to improve</div>
        </Card>
        <Card className="p-4 bg-rose-500/5 border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-rose-700 dark:text-rose-400 font-medium">Poor</span>
            <span className="text-rose-600 dark:text-rose-400 text-lg font-bold">{cwvSummary.poor}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">URLs failing</div>
        </Card>
      </div>

      {/* Mobile vs Desktop scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-primary" />
              Mobile Performance
            </CardTitle>
            <CardDescription>Avg score across {mobile.length} mobile URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <CwvGauge score={cwvSummary.mobileScore} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4 text-primary" />
              Desktop Performance
            </CardTitle>
            <CardDescription>Avg score across {desktop.length} desktop URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <CwvGauge score={cwvSummary.desktopScore} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed metrics table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Page Experience Metrics
          </CardTitle>
          <CardDescription>
            Real-user Core Web Vitals measurements across {webVitals.length} URL/device combinations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-y-auto rf-scroll">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-[60px]">Device</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-center">LCP</TableHead>
                  <TableHead className="text-center">FID</TableHead>
                  <TableHead className="text-center">CLS</TableHead>
                  <TableHead className="text-center">INP</TableHead>
                  <TableHead className="text-center">TTFB</TableHead>
                  <TableHead className="text-center">FCP</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webVitals.map((w) => (
                  <CwvRow key={w.id} w={w} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CwvRow({ w }: { w: CoreWebVital }) {
  const DeviceIcon = w.device === "mobile" ? Smartphone : Monitor;
  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell>
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md", w.device === "mobile" ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400")}>
          <DeviceIcon className="h-3.5 w-3.5" />
        </span>
      </TableCell>
      <TableCell className="font-mono text-xs truncate max-w-[200px]">{w.url}</TableCell>
      <CwvCell value={w.lcp} metricKey="lcp" />
      <CwvCell value={w.fid} metricKey="fid" />
      <CwvCell value={w.cls} metricKey="cls" />
      <CwvCell value={w.inp} metricKey="inp" />
      <CwvCell value={w.ttfb} metricKey="ttfb" />
      <CwvCell value={w.fcp} metricKey="fcp" />
      <TableCell className="text-center">
        <span className={cn("inline-flex min-w-10 justify-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums", cwvStatusBg[w.status], cwvStatusColor[w.status])}>
          {w.score}
        </span>
      </TableCell>
    </TableRow>
  );
}

function CwvCell({ value, metricKey }: { value: number; metricKey: string }) {
  const status = cwvStatus(value, metricKey);
  const cfg = cwvMetricConfig[metricKey];
  return (
    <TableCell className="text-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("inline-flex min-w-12 justify-center font-mono text-xs tabular-nums font-medium", cwvStatusColor[status])}>
              {value}{cfg.unit}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            {cfg.label} · {status === "good" ? "Good" : status === "needs-improvement" ? "Needs improvement" : "Poor"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
}

// ---------- SERP Features Panel ----------
const serpFeatureConfig: Record<string, { icon: typeof Star; label: string; color: string }> = {
  "featured-snippet": { icon: Star, label: "Featured Snippet", color: "#f59e0b" },
  sitelinks: { icon: LinkIcon, label: "Sitelinks", color: "#10b981" },
  reviews: { icon: Star, label: "Reviews", color: "#f43f5e" },
  faq: { icon: HelpCircle, label: "FAQ", color: "#8b5cf6" },
  video: { icon: Video, label: "Video", color: "#ef4444" },
  "image-pack": { icon: Image, label: "Image Pack", color: "#06b6d4" },
  "local-pack": { icon: MapPin, label: "Local Pack", color: "#14b8a6" },
  "top-stories": { icon: Newspaper, label: "Top Stories", color: "#0ea5e9" },
  "people-also-ask": { icon: HelpCircle, label: "People Also Ask", color: "#84cc16" },
};

export function SerpFeaturesPanel({ detail }: { detail: CompanyDetail }) {
  const { serpFeatures, serpSummary } = detail;
  const captureRate = serpFeatures.length > 0
    ? Math.round((serpSummary.captured / serpFeatures.length) * 100)
    : 0;
  const types = Object.keys(serpSummary.byType);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-muted-foreground font-medium">SERP Features Captured</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5 text-3xl font-bold tabular-nums">{serpSummary.captured}</div>
          <div className="text-xs text-muted-foreground mt-1">of {serpFeatures.length} tracked opportunities</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-muted-foreground font-medium">Capture Rate</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5 text-3xl font-bold tabular-nums">{captureRate}%</div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${captureRate}%` }} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-muted-foreground font-medium">Lost to Competitors</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1.5 text-3xl font-bold tabular-nums">{serpSummary.competitorOwned}</div>
          <div className="text-xs text-muted-foreground mt-1">features owned by rivals</div>
        </Card>
      </div>

      {/* Feature type breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            SERP Feature Breakdown
          </CardTitle>
          <CardDescription>Rich result types captured vs lost to competitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((t) => {
              const cfg = serpFeatureConfig[t] ?? { icon: Layers, label: t, color: "#64748b" };
              const Icon = cfg.icon;
              const stat = serpSummary.byType[t];
              const total = stat.captured + stat.competitorOwned;
              const capturedPct = total > 0 ? Math.round((stat.captured / total) * 100) : 0;
              return (
                <div key={t} className="rounded-xl border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${cfg.color}1a`, color: cfg.color }}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{cfg.label}</span>
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">{total}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
                      <div className="h-full" style={{ width: `${capturedPct}%`, backgroundColor: cfg.color }} />
                      <div className="h-full bg-rose-400/50" style={{ width: `${100 - capturedPct}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{capturedPct}%</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400">{stat.captured} captured</span>
                    <span className="text-rose-600 dark:text-rose-400">{stat.competitorOwned} lost</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed table */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked SERP Features</CardTitle>
          <CardDescription>All SERP feature opportunities for this company</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-y-auto rf-scroll">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-[60px]">Type</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serpFeatures.map((f) => {
                  const cfg = serpFeatureConfig[f.type] ?? { icon: Layers, label: f.type, color: "#64748b" };
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={f.id} className="hover:bg-muted/40">
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: `${cfg.color}1a`, color: cfg.color }}>
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{cfg.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{f.keyword}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">{f.url}</TableCell>
                      <TableCell className="text-center">
                        {f.competitorOwned ? (
                          <Badge variant="outline" className="text-rose-600 border-rose-500/30 bg-rose-500/5">Competitor</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5">Captured</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(f.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
