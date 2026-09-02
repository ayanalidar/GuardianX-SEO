"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFetch, formatNumber } from "@/lib/seo/hooks";
import { motion } from "framer-motion";
import { Calendar, Target, TrendingUp, Wrench, FileText, Link2, BarChart3, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type RoadmapItem = {
  week: number;
  priority: "critical" | "high" | "medium";
  category: string;
  title: string;
  description: string;
  projectedImpact: string;
  estimatedEffort: string;
  status: "todo" | "in-progress" | "done";
};

type RoadmapData = {
  roadmap: RoadmapItem[];
  summary: {
    totalActions: number;
    criticalActions: number;
    weeksPlanned: number;
    projectedTrafficGain: number;
    projectedRevenueGain: number;
  };
  goals: Array<{ label: string; current: number; target: number; progress: number }>;
};

const categoryIcons: Record<string, typeof Target> = {
  "Technical Fix": Wrench,
  "Content": FileText,
  "Outreach": Link2,
  "Optimization": TrendingUp,
  "Monitoring": BarChart3,
};

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "#ef4444", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", label: "Critical" },
  high: { color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "High" },
  medium: { color: "#0ea5e9", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400", label: "Medium" },
  low: { color: "#94a3b8", bg: "bg-muted text-muted-foreground", label: "Low" },
};

export function ActionRoadmap({ token }: { token: string }) {
  const { data, loading } = useFetch<RoadmapData>(`/api/client/${token}/roadmap`);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">Building your action roadmap…</CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Group by week
  const weeks: Record<number, RoadmapItem[]> = {};
  for (const item of data.roadmap) {
    if (!weeks[item.week]) weeks[item.week] = [];
    weeks[item.week].push(item);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          4-Week Action Roadmap
        </CardTitle>
        <CardDescription>Personalized, prioritized plan based on your real data — do these to grow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary banner */}
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Actions Planned</div>
              <div className="text-2xl font-bold tabular-nums">{data.summary.totalActions}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Critical Priority</div>
              <div className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{data.summary.criticalActions}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Projected Traffic Gain</div>
              <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">+{formatNumber(data.summary.projectedTrafficGain)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Projected Revenue Gain</div>
              <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">${formatNumber(data.summary.projectedRevenueGain)}</div>
            </div>
          </div>
        </div>

        {/* Weekly timeline */}
        {Object.entries(weeks).map(([weekNum, items]) => (
          <div key={weekNum}>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {weekNum}
              </span>
              <span className="text-sm font-semibold">Week {weekNum}</span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground">{items.length} actions</span>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => {
                const Icon = categoryIcons[item.category] ?? Target;
                const pCfg = priorityConfig[item.priority] ?? priorityConfig.medium;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${pCfg.color}1a`, color: pCfg.color }}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{item.title}</span>
                          <Badge variant="outline" className={cn("text-[9px]", pCfg.bg)}>{item.priority}</Badge>
                          <Badge variant="secondary" className="text-[9px]">{item.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                        <div className="mt-1.5 flex items-start gap-3 flex-wrap text-[10px]">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-3 w-3" />
                            {item.projectedImpact}
                          </span>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.estimatedEffort}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Goal progress */}
        {data.goals.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 rf-section-heading">Goal Progress</div>
            <div className="space-y-3">
              {data.goals.map((g, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{g.label}</span>
                    <span className="text-muted-foreground tabular-nums">{formatNumber(Math.round(g.current))} / {formatNumber(Math.round(g.target))} ({g.progress}%)</span>
                  </div>
                  <div className="h-2 rounded-full rf-progress-track overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${g.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn("h-full rounded-full rf-progress-fill", g.progress >= 100 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : g.progress >= 50 ? "bg-gradient-to-r from-teal-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
