"use client";

import { useNav } from "@/store/nav";
import { useFetch, formatNumber, formatPercent } from "@/lib/seo/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { scoreGrade } from "@/lib/seo/score";
import { DomainIcon } from "./icons";
import { DomainWithCompanies, CompanySummary } from "@/lib/seo/types";
import {
  ArrowLeft, GitCompare, Trophy, TrendingUp, Activity,
  KeyRound, Link2, Gauge, Eye, X, Crown, Minus,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CompareResult = {
  companies: Array<{
    company: CompanySummary & { domainId: string; createdAt: string; domain: { name: string; slug: string; icon: string; color: string; accent: string } };
    latest: any;
    topKeywords: any[];
    kwCount: number;
    blCount: number;
    issueCount: number;
    seoScore: { total: number; breakdown: { label: string; score: number; weight: number }[] };
    trafficDelta: number;
    metrics: Array<{ date: string; organicTraffic: number; visibilityScore: number; avgPosition: number; domainAuthority: number }>;
  }>;
};

export function CompareView({ companyIds }: { companyIds: string[] }) {
  const { data, loading } = useFetch<CompareResult>(
    `/api/compare?ids=${companyIds.join(",")}`
  );
  const backToOverview = useNav((s) => s.backToOverview);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data || data.companies.length < 2) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-16 text-center">
        <p className="text-muted-foreground">Need at least 2 companies to compare.</p>
        <Button variant="outline" className="mt-4" onClick={backToOverview}>
          Back to overview
        </Button>
      </div>
    );
  }

  const companies = data.companies;

  // Find the best value for each metric (for highlighting the winner)
  const bestTraffic = Math.max(...companies.map((c) => c.latest?.organicTraffic ?? 0));
  const bestScore = Math.max(...companies.map((c) => c.seoScore.total));
  const bestDA = Math.max(...companies.map((c) => c.latest?.domainAuthority ?? 0));
  const bestKw = Math.max(...companies.map((c) => c.kwCount));
  const bestBl = Math.max(...companies.map((c) => c.blCount));
  const bestVisibility = Math.max(...companies.map((c) => c.latest?.visibilityScore ?? 0));
  const bestPos = Math.min(...companies.map((c) => c.latest?.avgPosition ?? 999));

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={backToOverview} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Overview
          </button>
          <span className="text-foreground font-medium flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-primary" />
            Comparison: {companies.length} companies
          </span>
        </div>
      </div>

      {/* Company headers */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${companies.length}, minmax(0, 1fr))` }}
      >
        {companies.map((c) => {
          const grade = scoreGrade(c.seoScore.total);
          const isTop = c.seoScore.total === bestScore;
          return (
            <Card key={c.company.id} className={cn("relative overflow-hidden", isTop && "ring-2 ring-emerald-500/40")}>
              <div className="h-1.5 w-full" style={{ backgroundColor: c.company.domain.accent }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                      style={{ backgroundColor: c.company.domain.accent }}
                    >
                      {c.company.logoText}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base leading-tight truncate">{c.company.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <DomainIcon name={c.company.domain.icon} className="h-3 w-3" />
                        <span className="truncate">{c.company.domain.name}</span>
                      </div>
                    </div>
                  </div>
                  {isTop && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 gap-1 shrink-0">
                      <Crown className="h-3 w-3" />
                      Leader
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                      SEO Score
                    </div>
                    <div className="text-3xl font-bold tabular-nums" style={{ color: grade.color }}>
                      {c.seoScore.total}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: grade.color }}>
                      {grade.grade} · {grade.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trend overlay chart */}
      <TrendOverlay companies={companies} />

      {/* KPI comparison rows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Head-to-Head Metrics
          </CardTitle>
          <CardDescription>Best value in each row is highlighted</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Traffic row */}
          <CompareRow
            icon={Activity}
            label="Organic Traffic"
            companies={companies}
            getValue={(c) => c.latest?.organicTraffic ?? 0}
            format={(v) => formatNumber(v)}
            getDelta={(c) => c.trafficDelta}
            isBest={(v) => v === bestTraffic}
            higherIsBetter
          />
          <CompareRow
            icon={Eye}
            label="Visibility Score"
            companies={companies}
            getValue={(c) => c.latest?.visibilityScore ?? 0}
            format={(v) => `${v.toFixed(1)}%`}
            isBest={(v) => v === bestVisibility}
            higherIsBetter
          />
          <CompareRow
            icon={Gauge}
            label="Avg Position"
            companies={companies}
            getValue={(c) => c.latest?.avgPosition ?? 0}
            format={(v) => `#${v.toFixed(1)}`}
            isBest={(v) => v === bestPos}
            higherIsBetter={false}
          />
          <CompareRow
            icon={Gauge}
            label="Domain Authority"
            companies={companies}
            getValue={(c) => c.latest?.domainAuthority ?? 0}
            format={(v) => v.toFixed(1)}
            isBest={(v) => v === bestDA}
            higherIsBetter
          />
          <CompareRow
            icon={KeyRound}
            label="Keywords Tracked"
            companies={companies}
            getValue={(c) => c.kwCount}
            format={(v) => formatNumber(v)}
            isBest={(v) => v === bestKw}
            higherIsBetter
          />
          <CompareRow
            icon={Link2}
            label="Backlinks"
            companies={companies}
            getValue={(c) => c.blCount}
            format={(v) => formatNumber(v)}
            isBest={(v) => v === bestBl}
            higherIsBetter
          />
        </CardContent>
      </Card>

      {/* Score breakdown comparison */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Score Breakdown</CardTitle>
          <CardDescription>Component scores across all compared companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies[0].seoScore.breakdown.map((b, idx) => (
              <div key={b.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{b.label}</span>
                  <span className="text-xs text-muted-foreground">weight {Math.round(b.weight * 100)}%</span>
                </div>
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${companies.length}, minmax(0, 1fr))` }}
                >
                  {companies.map((c) => {
                    const score = c.seoScore.breakdown[idx].score;
                    const maxScore = Math.max(...companies.map((cc) => cc.seoScore.breakdown[idx].score));
                    const isBest = score === maxScore;
                    const grade = scoreGrade(score);
                    return (
                      <div key={c.company.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground truncate">{c.company.name}</span>
                          {isBest && <Crown className="h-3 w-3 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${score}%`, backgroundColor: grade.color }}
                            />
                          </div>
                          <span className="text-sm font-bold tabular-nums w-8 text-right">{score}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top keywords per company */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Top Ranking Keywords
          </CardTitle>
          <CardDescription>Top 5 keywords per company by position</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${companies.length}, minmax(0, 1fr))` }}
          >
            {companies.map((c) => (
              <div key={c.company.id} className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{c.company.name}</div>
                <div className="rounded-lg border divide-y">
                  {c.topKeywords.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground text-center">No keywords</div>
                  ) : (
                    c.topKeywords.map((k) => (
                      <div key={k.id} className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs truncate mr-2">{k.keyword}</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold tabular-nums shrink-0">
                          <span className={cn(
                            "inline-flex min-w-7 justify-center rounded px-1.5 py-0.5",
                            k.position <= 3 && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                            k.position > 3 && k.position <= 10 && "bg-teal-500/15 text-teal-700 dark:text-teal-300",
                            k.position > 10 && "bg-muted text-muted-foreground"
                          )}>
                            #{k.position}
                          </span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompareRow({
  icon: Icon,
  label,
  companies,
  getValue,
  format,
  getDelta,
  isBest,
  higherIsBetter,
}: {
  icon: typeof Activity;
  label: string;
  companies: CompareResult["companies"];
  getValue: (c: CompareResult["companies"][number]) => number;
  format: (v: number) => string;
  getDelta?: (c: CompareResult["companies"][number]) => number;
  isBest: (v: number) => boolean;
  higherIsBetter: boolean;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 px-4 py-4 border-b last:border-b-0 items-center hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 text-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${companies.length}, minmax(0, 1fr))` }}
      >
        {companies.map((c) => {
          const value = getValue(c);
          const best = isBest(value);
          const delta = getDelta?.(c);
          return (
            <div key={c.company.id} className={cn("rounded-lg p-3 transition-all", best ? "bg-emerald-500/10 ring-1 ring-emerald-500/30" : "bg-muted/30")}>
              <div className="flex items-center gap-2">
                <span className={cn("text-xl font-bold tabular-nums", best && higherIsBetter && "text-emerald-600 dark:text-emerald-400")}>
                  {format(value)}
                </span>
                {best && <Crown className="h-3.5 w-3.5 text-amber-500" />}
              </div>
              {typeof delta === "number" && (
                <div className={cn("text-xs font-semibold mt-0.5", delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {formatPercent(delta)} 30d
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Compare Bar (floating action bar for selecting companies) ----------
export function CompareBar({ domains }: { domains: DomainWithCompanies[] }) {
  const compareMode = useNav((s) => s.compareMode);
  const compareIds = useNav((s) => s.compareIds);
  const toggleCompareMode = useNav((s) => s.toggleCompareMode);
  const toggleCompareId = useNav((s) => s.toggleCompareId);
  const clearCompare = useNav((s) => s.clearCompare);
  const openCompare = useNav((s) => s.openCompare);

  if (!compareMode) return null;

  const selected = compareIds
    .map((id) => domains.flatMap((d) => d.companies).find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(720px,calc(100vw-2rem))]">
      <div className="rounded-2xl border rf-glass shadow-2xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <GitCompare className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">Compare Mode</div>
              <div className="text-xs text-muted-foreground">
                {selected.length}/4 selected · click company cards to add
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearCompare} className="gap-1.5">
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={selected.length < 2}
              onClick={() => openCompare(compareIds)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5"
            >
              <GitCompare className="h-3.5 w-3.5" />
              Compare {selected.length >= 2 ? `(${selected.length})` : ""}
            </Button>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((c) => (
              <div key={c.id} className="inline-flex items-center gap-1.5 rounded-full border bg-background pl-2 pr-1 py-1">
                <span className="text-xs font-medium">{c.name}</span>
                <button
                  onClick={() => toggleCompareId(c.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Multi-company trend overlay chart ----------
const TREND_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6"];
const TREND_METRICS = [
  { key: "organicTraffic", label: "Organic Traffic", format: (v: number) => formatNumber(v) },
  { key: "visibilityScore", label: "Visibility Score", format: (v: number) => v.toFixed(1) + "%" },
  { key: "avgPosition", label: "Avg Position", format: (v: number) => "#" + v.toFixed(1) },
  { key: "domainAuthority", label: "Domain Authority", format: (v: number) => v.toFixed(1) },
] as const;

function TrendOverlay({ companies }: { companies: CompareResult["companies"] }) {
  const [activeMetric, setActiveMetric] = useState<(typeof TREND_METRICS)[number]["key"]>("organicTraffic");
  const cfg = TREND_METRICS.find((m) => m.key === activeMetric)!;

  // Build chart data — use first company's dates as x-axis
  const data: Array<Record<string, number | string>> = [];
  if (companies.length > 0 && companies[0].metrics) {
    companies[0].metrics.forEach((m, i) => {
      const row: Record<string, number | string> = { date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
      companies.forEach((c) => {
        const cm = c.metrics?.[i];
        if (cm) row[c.company.name] = cm[activeMetric];
      });
      data.push(row);
    });
  }

  const tooltipStyle = {
    borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)",
    color: "var(--popover-foreground)", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trend Overlay
            </CardTitle>
            <CardDescription>30-day {cfg.label.toLowerCase()} comparison across all selected companies</CardDescription>
          </div>
          <div className="flex gap-1">
            {TREND_METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  activeMetric === m.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => cfg.format(v)} width={56} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => cfg.format(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            {companies.map((c, i) => (
              <Line
                key={c.company.id}
                type="monotone"
                dataKey={c.company.name}
                stroke={TREND_COLORS[i % TREND_COLORS.length]}
                strokeWidth={2.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
