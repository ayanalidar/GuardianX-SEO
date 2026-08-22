"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Competitor, SeoMetric } from "@/lib/seo/types";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip,
} from "recharts";
import { Target, Crown } from "lucide-react";
import { useMemo } from "react";

// 6 dimensions, all normalized to 0-100
type Dim = { dim: string; company: number; [key: string]: number | string };

const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e"];

function normalize(value: number, min: number, max: number, invert = false): number {
  const v = Math.max(min, Math.min(max, value));
  const pct = ((v - min) / (max - min)) * 100;
  return Math.round(invert ? 100 - pct : pct);
}

export function CompetitiveRadar({
  companyName,
  latest,
  competitors,
}: {
  companyName: string;
  latest: SeoMetric | null;
  competitors: Competitor[];
}) {
  const data = useMemo<Dim[]>(() => {
    const dims = ["Traffic", "Authority", "Visibility", "Keywords", "Backlinks", "Position"];
    return dims.map((dim) => {
      const row: Dim = { dim, company: 0 };
      if (latest) {
        if (dim === "Traffic") row.company = normalize(latest.organicTraffic, 0, 5000000);
        if (dim === "Authority") row.company = normalize(latest.domainAuthority, 0, 100);
        if (dim === "Visibility") row.company = normalize(latest.visibilityScore, 0, 100);
        if (dim === "Keywords") row.company = normalize(latest.keywordsRanked, 0, 200000);
        if (dim === "Backlinks") row.company = normalize(latest.backlinks, 0, 1000000);
        if (dim === "Position") row.company = normalize(latest.avgPosition, 1, 50, true); // invert (lower=better)
      }
      competitors.slice(0, 4).forEach((c, i) => {
        const key = `comp${i}`;
        if (dim === "Traffic") row[key] = normalize(c.organicTraffic, 0, 5000000);
        else if (dim === "Authority") row[key] = normalize(c.domainAuthority, 0, 100);
        else if (dim === "Visibility") row[key] = normalize(c.organicTraffic / 100, 0, 100); // proxy
        else if (dim === "Keywords") row[key] = normalize(c.commonKeywords, 0, 10000);
        else if (dim === "Backlinks") row[key] = normalize(c.backlinks, 0, 1000000);
        else if (dim === "Position") row[key] = normalize(50 - c.domainAuthority / 2, 1, 50, true);
      });
      return row;
    });
  }, [latest, competitors]);

  // Find leader (highest avg across dims)
  const avgScore = (key: string) => {
    const sum = data.reduce((s, d) => s + (d[key] as number), 0);
    return sum / data.length;
  };
  const companyAvg = avgScore("company");
  const compAvgs = competitors.slice(0, 4).map((c, i) => ({ name: c.name, avg: avgScore(`comp${i}`) }));
  const allAvgs = [{ name: companyName, avg: companyAvg, isCompany: true }, ...compAvgs];
  const leader = allAvgs.reduce((max, x) => (x.avg > max.avg ? x : max), allAvgs[0]);

  const tooltipStyle = {
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--popover)",
    color: "var(--popover-foreground)",
    fontSize: 12,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Competitive Landscape
        </CardTitle>
        <CardDescription>
          {companyName} vs top {Math.min(4, competitors.length)} competitors across 6 SEO dimensions
          {leader.isCompany ? " · You lead!" : ` · Leader: ${leader.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="dim" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} angle={90} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [Math.round(v), "Score"]} />
            <Radar name={companyName} dataKey="company" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.35} strokeWidth={2} />
            {competitors.slice(0, 4).map((c, i) => (
              <Radar
                key={i}
                name={c.name}
                dataKey={`comp${i}`}
                stroke={COLORS[i + 1]}
                fill={COLORS[i + 1]}
                fillOpacity={0.08}
                strokeWidth={1.5}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Leaderboard */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {allAvgs.sort((a, b) => b.avg - a.avg).map((a, i) => (
            <div
              key={i}
              className={`rounded-lg border p-2.5 text-center ${a.isCompany ? "bg-primary/5 border-primary/30" : ""}`}
            >
              <div className="flex items-center justify-center gap-1">
                {i === 0 && <Crown className="h-3 w-3 text-amber-500" />}
                <span className="text-xs font-medium truncate">{a.name}</span>
              </div>
              <div className="text-lg font-bold tabular-nums mt-0.5">{Math.round(a.avg)}</div>
              <div className="text-[10px] text-muted-foreground">avg score</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
