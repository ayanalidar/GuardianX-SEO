"use client";

import { use, useEffect, useState } from "react";
import { useFetch, formatNumber, formatPercent, formatFull } from "@/lib/seo/hooks";
import type { CompanyDetail } from "@/lib/seo/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  AnimatedCounter, AnimatedScoreRing, CinematicBackground,
  Reveal, StaggerContainer, StaggerItem,
} from "@/components/rankforge/motion";
import { CompetitiveRadar } from "./features/competitive-radar";
import { SeoForecast } from "./features/seo-forecast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Rocket, Globe, Activity, KeyRound, Link2, Gauge, Eye,
  TrendingUp, TrendingDown, Target, CheckCircle2, Circle,
  Clock, Calendar, Copy, ExternalLink, Sparkles, Zap,
  AlertTriangle, Trophy, ArrowRight, Bot, ListChecks, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ClientData = CompanyDetail & {
  client: {
    id: string;
    name: string;
    email: string;
    role: string;
    primaryGoal: string;
    targetKeywords: number;
    targetTraffic: number;
    targetDA: number;
    onboardedAt: string;
    lastVisit: string | null;
  };
  goals: Array<{
    id: string;
    type: string;
    label: string;
    target: number;
    current: number;
    progress: number;
    deadline: string | null;
    status: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    priority: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
  }>;
};

export function ClientPortal({ token }: { token: string }) {
  const { data, loading, error } = useFetch<ClientData>(`/api/client/${token}`);
  const { toast } = useToast();
  const [taskFilter, setTaskFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const [celebrated, setCelebrated] = useState<string[]>([]);

  // Goal achievement notifications — celebrate goals at 100% (computed after data loads)
  const achievedGoals = (data?.goals ?? []).filter((g) => g.progress >= 100);
  const newlyAchieved = achievedGoals.filter((g) => !celebrated.includes(g.id));
  useEffect(() => {
    if (newlyAchieved.length === 0) return;
    const t = setTimeout(() => {
      setCelebrated((c) => [...c, ...newlyAchieved.map((g) => g.id)]);
    }, 6000);
    return () => clearTimeout(t);
  }, [newlyAchieved.length]);

  const copyLink = () => {
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Portal link copied!", description: "Share it with your team." });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="mx-auto max-w-[1200px] w-full px-4 md:px-6 py-8 space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">Invalid Portal Link</h2>
          <p className="text-muted-foreground mt-2">
            This client portal link is no longer valid or has been removed.
            Please contact your SEO provider for a new link.
          </p>
        </Card>
      </div>
    );
  }

  const { company, domain, latest, seoScore, metrics, client, goals, tasks, trafficDelta } = data;

  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter((t) => t.status === taskFilter);
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const taskProgress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Goal achievement celebration banner */}
      <AnimatePresence>
        {newlyAchieved.length > 0 && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[min(520px,calc(100vw-2rem))]"
          >
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 backdrop-blur-xl shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                >
                  <Trophy className="h-6 w-6" />
                </motion.span>
                <div className="flex-1">
                  <div className="font-bold text-sm">Goal Achieved! 🎉</div>
                  <div className="text-xs text-muted-foreground">
                    {newlyAchieved[0].label} hit 100%
                    {newlyAchieved.length > 1 && ` +${newlyAchieved.length - 1} more`}
                  </div>
                </div>
                <button
                  onClick={() => setCelebrated((c) => [...c, ...newlyAchieved.map((g) => g.id)])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Portal header (different from main app) */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 md:px-6">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <Rocket className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] tracking-tight">{company.name} · Portal</div>
            <div className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              RankForge Client Dashboard
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Visit Site</span>
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-[1200px] w-full px-4 md:px-6 py-8 space-y-6">
        {/* Welcome hero */}
        <Reveal>
          <section className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8">
            <CinematicBackground variant="mesh" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-6">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 rf-pulse-dot" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Welcome, {client.name.split(" ")[0]}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-4 text-3xl md:text-4xl font-bold tracking-tight"
                >
                  {company.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 text-muted-foreground max-w-2xl"
                >
                  {company.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
                >
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    {company.website}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    {client.primaryGoal}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Onboarded {new Date(client.onboardedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </motion.div>
              </div>
              <div className="flex items-center gap-6 shrink-0 self-center">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    SEO Health
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Composite score</div>
                </div>
                <AnimatedScoreRing score={seoScore.total} size={130} />
              </div>
            </div>
          </section>
        </Reveal>

        {/* KPI cards with animated counters */}
        <StaggerContainer className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6" stagger={0.08}>
          <StaggerItem>
            <KpiCard icon={Activity} label="Organic Traffic" value={<AnimatedCounter value={latest?.organicTraffic ?? 0} />} delta={trafficDelta} accent="#10b981" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard icon={KeyRound} label="Keywords Ranked" value={<AnimatedCounter value={latest?.keywordsRanked ?? 0} />} sub={`${data.keywords.length} tracked`} accent="#14b8a6" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard icon={Gauge} label="Avg Position" value={latest ? `#${(latest.avgPosition).toFixed(1)}` : "—"} sub={`Visibility ${latest?.visibilityScore.toFixed(0)}%`} accent="#f59e0b" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard icon={Eye} label="Domain Authority" value={<AnimatedCounter value={latest?.domainAuthority ?? 0} decimals={1} format={false} />} sub={latest ? `PA ${latest.pageAuthority.toFixed(0)}` : ""} accent="#8b5cf6" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard icon={Link2} label="Backlinks" value={<AnimatedCounter value={latest?.backlinks ?? 0} />} sub={`${data.backlinkStats.dofollow} dofollow`} accent="#06b6d4" />
          </StaggerItem>
          <StaggerItem>
            <KpiCard icon={Eye} label="Impressions" value={<AnimatedCounter value={latest?.impressions ?? 0} />} sub={latest ? `CTR ${latest.ctr.toFixed(1)}%` : ""} accent="#0ea5e9" />
          </StaggerItem>
        </StaggerContainer>

        {/* Goals + Tasks row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Goals */}
          <Reveal>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Goal Tracking
                </CardTitle>
                <CardDescription>Progress toward your SEO targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((g, i) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{g.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFull(Math.round(g.current))} / {formatFull(Math.round(g.target))}
                        {g.type === "position" ? " (lower=better)" : ""}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${g.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          g.progress >= 100 ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : g.progress >= 50 ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                          : "bg-gradient-to-r from-amber-500 to-orange-500"
                        )}
                      />
                      {g.progress >= 100 && (
                        <span className="absolute right-1 top-1/2 -translate-y-1/2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{g.progress}% complete</span>
                      {g.deadline && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </Reveal>

          {/* Tasks */}
          <Reveal delay={0.1}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-primary" />
                      Action Plan
                    </CardTitle>
                    <CardDescription>
                      {doneTasks}/{tasks.length} tasks done · {taskProgress}% complete
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {(["all", "todo", "in-progress", "done"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setTaskFilter(f)}
                        className={cn(
                          "rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors",
                          taskFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                        )}
                      >
                        {f === "in-progress" ? "Doing" : f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${taskProgress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[420px] overflow-y-auto rf-scroll">
                  {filteredTasks.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No tasks in this filter.</div>
                  ) : (
                    filteredTasks.map((t, i) => (
                      <TaskRow key={t.id} task={t} token={token} index={i} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Score breakdown */}
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                SEO Score Breakdown
              </CardTitle>
              <CardDescription>Weighted components of your composite SEO score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {seoScore.breakdown.map((b, i) => (
                  <motion.div
                    key={b.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{b.label}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{Math.round(b.weight * 100)}%</span>
                    </div>
                    <div className="mt-1 text-2xl font-bold tabular-nums">
                      <AnimatedCounter value={b.score} format={false} />
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${b.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: b.score >= 75 ? "#10b981" : b.score >= 50 ? "#f59e0b" : "#ef4444" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* Competitive Landscape */}
        <Reveal>
          <CompetitiveRadar companyName={company.name} latest={latest} competitors={data.competitors} />
        </Reveal>

        {/* AI Forecast */}
        <Reveal>
          <SeoForecast companyId={company.id} />
        </Reveal>

        {/* Quick stats footer */}
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              icon={Zap}
              label="Open Issues"
              value={data.issueStats.critical + data.issueStats.warning}
              hint={`${data.issueStats.critical} critical`}
              color="#f59e0b"
            />
            <MiniStat
              icon={TrendingUp}
              label="SERP Features"
              value={data.serpSummary.captured}
              hint={`${data.serpSummary.competitorOwned} lost to competitors`}
              color="#10b981"
            />
            <MiniStat
              icon={Activity}
              label="CWV Avg Score"
              value={data.cwvSummary.avgScore}
              hint={`${data.cwvSummary.good} good / ${data.cwvSummary.poor} poor`}
              color="#14b8a6"
            />
          </div>
        </Reveal>
      </main>

      <footer className="mt-auto border-t bg-background/60">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-5 text-center text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">RankForge SEO</span> · Client Portal · {company.name}
          <span className="mx-2">·</span>
          Powered by RankForge AI
        </div>
      </footer>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: React.ReactNode;
  delta?: number;
  sub?: string;
  accent: string;
}) {
  return (
    <Card className="p-4 gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
        </div>
        {typeof delta === "number" && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              delta >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
    </Card>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hint,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  hint: string;
  color: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1a`, color }}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
        <div className="text-xl font-bold tabular-nums">
          <AnimatedCounter value={value} format={false} />
        </div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </Card>
  );
}

function TaskRow({ task, token, index }: { task: ClientData["tasks"][number]; token: string; index: number }) {
  const [status, setStatus] = useState(task.status);
  const [updating, setUpdating] = useState(false);

  const cycle = async () => {
    const next = status === "todo" ? "in-progress" : status === "in-progress" ? "done" : "todo";
    setUpdating(true);
    try {
      await fetch(`/api/client/${token}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: next }),
      });
      setStatus(next);
    } finally {
      setUpdating(false);
    }
  };

  const Icon = status === "done" ? CheckCircle2 : status === "in-progress" ? Clock : Circle;
  const iconColor = status === "done" ? "#10b981" : status === "in-progress" ? "#f59e0b" : "#94a3b8";

  const priorityColor =
    task.priority === "high" ? "text-rose-600 bg-rose-500/10"
    : task.priority === "medium" ? "text-amber-600 bg-amber-500/10"
    : "text-sky-600 bg-sky-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 border-b last:border-b-0 px-4 py-3 hover:bg-muted/30 transition-colors"
    >
      <button
        onClick={cycle}
        disabled={updating}
        className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
        style={{ color: iconColor }}
        aria-label="Toggle task status"
      >
        <Icon className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium", status === "done" && "line-through text-muted-foreground")}>
          {task.title}
        </div>
        {task.description && (
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</div>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" className={cn("text-[10px] capitalize", priorityColor)}>{task.priority}</Badge>
          <Badge variant="outline" className="text-[10px] capitalize">{task.category}</Badge>
          {task.dueDate && (
            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
