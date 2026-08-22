"use client";

import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, Cell, PieChart, Pie,
} from "recharts";
import { SeoMetric } from "@/lib/seo/types";
import { formatNumber } from "@/lib/seo/hooks";

const CHART_COLORS = {
  emerald: "#10b981",
  teal: "#14b8a6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  lime: "#84cc16",
};

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

export function TrafficChart({ metrics }: { metrics: SeoMetric[] }) {
  const data = metrics.map((m) => ({
    date: shortDate(m.date),
    traffic: m.organicTraffic,
    clicks: m.organicClicks,
    impressions: m.impressions,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} width={48} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [formatNumber(v), "Traffic"]}
        />
        <Area
          type="monotone"
          dataKey="traffic"
          stroke={CHART_COLORS.emerald}
          strokeWidth={2.5}
          fill="url(#trafficGrad)"
          isAnimationActive
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VisibilityChart({ metrics }: { metrics: SeoMetric[] }) {
  const data = metrics.map((m) => ({
    date: shortDate(m.date),
    visibility: m.visibilityScore,
    position: m.avgPosition,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={36} domain={[0, 100]} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={36} domain={[0, 50]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line yAxisId="left" type="monotone" dataKey="visibility" stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={false} name="Visibility %" isAnimationActive animationDuration={1200} animationEasing="ease-out" />
        <Line yAxisId="right" type="monotone" dataKey="position" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} strokeDasharray="4 4" name="Avg Position" isAnimationActive animationDuration={1400} animationEasing="ease-out" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PositionDistribution({ buckets }: { buckets: number[] }) {
  const labels = ["1-3", "4-10", "11-20", "21-50", "51-100"];
  const colors = [CHART_COLORS.emerald, CHART_COLORS.teal, CHART_COLORS.cyan, CHART_COLORS.amber, CHART_COLORS.rose];
  const data = labels.map((l, i) => ({ name: l, value: buckets[i], color: colors[i] }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1000} animationEasing="ease-out">
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AuthorityChart({ metrics }: { metrics: SeoMetric[] }) {
  const data = metrics.map((m) => ({
    date: shortDate(m.date),
    DA: m.domainAuthority,
    PA: m.pageAuthority,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="daGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.3} />
            <stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="DA" stroke={CHART_COLORS.violet} strokeWidth={2.5} fill="url(#daGrad)" name="Domain Authority" isAnimationActive animationDuration={1200} animationEasing="ease-out" />
        <Line type="monotone" dataKey="PA" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} name="Page Authority" isAnimationActive animationDuration={1400} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BacklinkTypeChart({
  dofollow,
  nofollow,
}: {
  dofollow: number;
  nofollow: number;
}) {
  const data = [
    { name: "Dofollow", value: dofollow, color: CHART_COLORS.emerald },
    { name: "Nofollow", value: nofollow, color: CHART_COLORS.amber },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={70}
          paddingAngle={3}
          isAnimationActive
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function KeywordTrendSparkline({ trend }: { trend: string }) {
  let data: { i: number; p: number }[] = [];
  try {
    const parsed = JSON.parse(trend);
    data = parsed.map((p: { date: string; position: number }, i: number) => ({
      i,
      p: p.position,
    }));
  } catch {
    data = [];
  }
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="p"
          stroke={CHART_COLORS.emerald}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive
          animationDuration={800}
        />
        <YAxis hide domain={["dataMin", "dataMax"]} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ScoreRadial({ score }: { score: number }) {
  const data = [{ name: "score", value: score, fill: "#10b981" }];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={14}
        data={data}
        startAngle={90}
        endAngle={90 - (score / 100) * 360}
      >
        <RadialBar background dataKey="value" cornerRadius={10} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

// Core Web Vitals gauge — semicircle gauge with color zones
export function CwvGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Good" : score >= 50 ? "Needs Improvement" : "Poor";
  // semicircle gauge: 180° arc
  const data = [{ name: "score", value: score, fill: color }];
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          cx="50%"
          cy="100%"
          innerRadius="80%"
          outerRadius="100%"
          barSize={16}
          data={data}
          startAngle={180}
          endAngle={180 - (score / 100) * 180}
        >
          <RadialBar background={{ fill: "var(--muted)" }} dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>{Math.round(score)}</span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}
