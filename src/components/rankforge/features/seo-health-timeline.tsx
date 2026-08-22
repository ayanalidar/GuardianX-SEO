"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SeoMetric } from "@/lib/seo/types";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { useState, useMemo } from "react";
import { formatNumber } from "@/lib/seo/hooks";
import { Activity, Gauge, Eye, Link2, KeyRound, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const METRICS = [
  { key: "organicTraffic", label: "Organic Traffic", icon: Activity, color: "#10b981", format: (v: number) => formatNumber(v) },
  { key: "visibilityScore", label: "Visibility Score", icon: Eye, color: "#14b8a6", format: (v: number) => v.toFixed(1) + "%" },
  { key: "avgPosition", label: "Avg Position", icon: Gauge, color: "#f59e0b", format: (v: number) => "#" + v.toFixed(1) },
  { key: "domainAuthority", label: "Domain Authority", icon: TrendingUp, color: "#8b5cf6", format: (v: number) => v.toFixed(1) },
  { key: "backlinks", label: "Backlinks", icon: Link2, color: "#06b6d4", format: (v: number) => formatNumber(v) },
  { key: "keywordsRanked", label: "Keywords Ranked", icon: KeyRound, color: "#0ea5e9", format: (v: number) => formatNumber(v) },
] as const;

// Generate synthetic "events" from the metrics timeline
function generateEvents(metrics: SeoMetric[]) {
  if (metrics.length < 5) return [];
  const events: Array<{ date: string; label: string; type: string }> = [];
  for (let i = 1; i < metrics.length; i++) {
    const prev = metrics[i - 1];
    const cur = metrics[i];
    const trafficDelta = (cur.organicTraffic - prev.organicTraffic) / Math.max(1, prev.organicTraffic);
    if (trafficDelta > 0.08) {
      events.push({ date: cur.date, label: `Traffic surge +${(trafficDelta * 100).toFixed(0)}%`, type: "surge" });
    } else if (trafficDelta < -0.06) {
      events.push({ date: cur.date, label: `Traffic dip ${(trafficDelta * 100).toFixed(0)}%`, type: "dip" });
    }
    const posDelta = cur.avgPosition - prev.avgPosition;
    if (posDelta < -2) {
      events.push({ date: cur.date, label: `Ranking improvement`, type: "gain" });
    }
  }
  return events.slice(0, 6);
}

export function SeoHealthTimeline({ metrics }: { metrics: SeoMetric[] }) {
  const [activeMetric, setActiveMetric] = useState<(typeof METRICS)[number]["key"]>("organicTraffic");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = useMemo(
    () => metrics.map((m) => ({ date: shortDate(m.date), ...m })),
    [metrics]
  );

  const events = useMemo(() => generateEvents(metrics), [metrics]);
  const cfg = METRICS.find((m) => m.key === activeMetric)!;
  const Icon = cfg.icon;

  const hoverMetric = hoverIdx !== null ? metrics[hoverIdx] : metrics[metrics.length - 1];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              SEO Health Timeline
            </CardTitle>
            <CardDescription>30-day interactive metric history with event annotations</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            {METRICS.map((m) => {
              const MIcon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                    activeMetric === m.key ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                  style={activeMetric === m.key ? { backgroundColor: m.color } : undefined}
                >
                  <MIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current value display */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${cfg.color}1a`, color: cfg.color }}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{cfg.label}</div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: cfg.color }}>
                {hoverMetric ? cfg.format(hoverMetric[activeMetric] as unknown as number) : "—"}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {hoverMetric ? shortDate(hoverMetric.date) : ""}
            {hoverIdx === null && <span className="ml-1">(latest)</span>}
          </div>
        </div>

        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const idx = Math.round((x / rect.width) * (data.length - 1));
            setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
          }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} width={48} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [cfg.format(v), cfg.label]}
                labelStyle={{ fontWeight: 600 }}
              />
              {events.map((ev, i) => (
                <ReferenceLine
                  key={i}
                  x={shortDate(ev.date)}
                  stroke={ev.type === "surge" || ev.type === "gain" ? "#10b981" : "#f43f5e"}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              ))}
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={cfg.color}
                strokeWidth={2.5}
                fill="url(#timelineGrad)"
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Event annotations */}
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Detected Events</div>
            <div className="flex flex-wrap gap-2">
              {events.map((ev, i) => (
                <div
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    ev.type === "surge" || ev.type === "gain"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", ev.type === "surge" || ev.type === "gain" ? "bg-emerald-500" : "bg-rose-500")} />
                  {ev.label}
                  <span className="text-muted-foreground font-normal">{shortDate(ev.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
