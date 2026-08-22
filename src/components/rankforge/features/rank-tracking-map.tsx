"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RankGeo } from "@/lib/seo/types";
import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/seo/hooks";
import { Map as MapIcon, Globe, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified country positions on a grid (for a stylized world map)
const COUNTRY_POS: Record<string, { x: number; y: number; flag: string }> = {
  US: { x: 18, y: 38, flag: "🇺🇸" },
  CA: { x: 16, y: 26, flag: "🇨🇦" },
  BR: { x: 28, y: 68, flag: "🇧🇷" },
  GB: { x: 45, y: 28, flag: "🇬🇧" },
  FR: { x: 46, y: 34, flag: "🇫🇷" },
  DE: { x: 48, y: 30, flag: "🇩🇪" },
  IN: { x: 65, y: 46, flag: "🇮🇳" },
  SG: { x: 72, y: 58, flag: "🇸🇬" },
  JP: { x: 82, y: 36, flag: "🇯🇵" },
  AU: { x: 80, y: 72, flag: "🇦🇺" },
};

const rankColor = (pos: number) => {
  if (pos <= 3) return "#10b981";
  if (pos <= 10) return "#14b8a6";
  if (pos <= 20) return "#f59e0b";
  if (pos <= 50) return "#f97316";
  return "#94a3b8";
};

export function RankTrackingMap({ rankGeo }: { rankGeo: RankGeo[] }) {
  const [selectedKw, setSelectedKw] = useState<string | null>(null);

  const keywords = useMemo(() => {
    const set = new Set(rankGeo.map((r) => r.keyword));
    return Array.from(set);
  }, [rankGeo]);

  const filtered = selectedKw ? rankGeo.filter((r) => r.keyword === selectedKw) : rankGeo;

  // aggregate by country
  const byCountry = useMemo(() => {
    const map = new Map<string, { country: string; countryCode: string; avgPos: number; count: number; totalVol: number }>();
    for (const r of filtered) {
      if (!map.has(r.countryCode)) {
        map.set(r.countryCode, { country: r.country, countryCode: r.countryCode, avgPos: 0, count: 0, totalVol: 0 });
      }
      const e = map.get(r.countryCode)!;
      e.avgPos += r.position;
      e.count++;
      e.totalVol += r.searchVolume;
    }
    map.forEach((v) => { v.avgPos = v.avgPos / v.count; });
    return Array.from(map.values()).sort((a, b) => a.avgPos - b.avgPos);
  }, [filtered]);

  const bestCountry = byCountry[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-primary" />
              Rank Tracking Map
            </CardTitle>
            <CardDescription>Geographic SERP positions across {byCountry.length} countries</CardDescription>
          </div>
          <select
            value={selectedKw ?? ""}
            onChange={(e) => setSelectedKw(e.target.value || null)}
            className="rounded-lg border bg-background px-2.5 py-1.5 text-xs"
          >
            <option value="">All keywords</option>
            {keywords.map((k) => (
              <option key={k} value={k}>{k.length > 24 ? k.slice(0, 22) + "…" : k}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stylized world map */}
        <div className="relative w-full rounded-xl border bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden" style={{ aspectRatio: "2/1" }}>
          {/* dotted grid background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, var(--muted-foreground) 0.5px, transparent 0.5px)",
              backgroundSize: "12px 12px",
            }}
          />
          {/* country pins */}
          {byCountry.map((c) => {
            const pos = COUNTRY_POS[c.countryCode];
            if (!pos) return null;
            const color = rankColor(c.avgPos);
            const size = 10 + (c.count / 10) * 16;
            return (
              <div
                key={c.countryCode}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div
                  className="rounded-full border-2 border-background shadow-lg flex items-center justify-center text-[10px]"
                  style={{ width: size, height: size, backgroundColor: color }}
                  title={`${c.country}: avg #${c.avgPos.toFixed(1)}`}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">{pos.flag}</span>
                </div>
                {/* tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-lg">
                  <div className="font-semibold">{pos.flag} {c.country}</div>
                  <div className="text-muted-foreground">Avg pos <strong className="text-foreground">#{c.avgPos.toFixed(1)}</strong></div>
                  <div className="text-muted-foreground">{c.count} keywords · {formatNumber(c.totalVol)} vol</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Country leaderboard */}
        <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto rf-scroll">
          {byCountry.map((c, i) => {
            const pos = COUNTRY_POS[c.countryCode];
            const color = rankColor(c.avgPos);
            return (
              <div key={c.countryCode} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
                <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                <span className="text-base">{pos?.flag}</span>
                <span className="text-sm font-medium flex-1 truncate">{c.country}</span>
                <span className="text-xs text-muted-foreground">{c.count} kw</span>
                <span className="inline-flex min-w-12 justify-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-white" style={{ backgroundColor: color }}>
                  #{c.avgPos.toFixed(1)}
                </span>
                {bestCountry?.countryCode === c.countryCode && (
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Top 3</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" />4-10</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />11-20</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />21-50</span>
          </div>
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            Hover pins for details
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
