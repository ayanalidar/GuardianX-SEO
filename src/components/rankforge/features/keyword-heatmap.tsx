"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Keyword } from "@/lib/seo/types";
import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/seo/hooks";
import { Grid3x3, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function KeywordHeatmap({ keywords }: { keywords: Keyword[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // X = difficulty (0-100), Y = search volume (log scale)
  // bubble size = opportunity score
  const points = useMemo(() => {
    return keywords
      .filter((k) => k.searchVolume > 0)
      .map((k) => {
        // opportunity = high volume, low difficulty, good position
        const volScore = Math.min(100, (Math.log10(k.searchVolume) / Math.log10(30000)) * 100);
        const diffScore = 100 - k.difficulty;
        const posScore = Math.max(0, 100 - k.position * 2);
        const opportunity = Math.round(volScore * 0.4 + diffScore * 0.35 + posScore * 0.25);
        return {
          id: k.id,
          keyword: k.keyword,
          x: k.difficulty,
          y: k.searchVolume,
          opportunity,
          position: k.position,
          volume: k.searchVolume,
          difficulty: k.difficulty,
        };
      });
  }, [keywords]);

  const maxVol = Math.max(...points.map((p) => p.volume), 1);
  const color = (opp: number) =>
    opp >= 70 ? "#10b981" : opp >= 50 ? "#f59e0b" : opp >= 30 ? "#f97316" : "#94a3b8";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-primary" />
          Keyword Opportunities Heatmap
        </CardTitle>
        <CardDescription>
          Bubble = keyword · X = difficulty · Y = search volume · size & color = opportunity score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[16/10] w-full rounded-xl border bg-muted/20 overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[25, 50, 75].map((p) => (
              <div key={`v${p}`} className="absolute top-0 bottom-0 border-l border-dashed border-border/60" style={{ left: `${p}%` }} />
            ))}
            {[25, 50, 75].map((p) => (
              <div key={`h${p}`} className="absolute left-0 right-0 border-t border-dashed border-border/60" style={{ top: `${p}%` }} />
            ))}
          </div>

          {/* Quadrant labels */}
          <div className="absolute top-2 left-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            ⭐ Best opportunities
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] font-medium text-muted-foreground">
            Low priority
          </div>

          {/* Bubbles */}
          <svg className="absolute inset-0 w-full h-full">
            {points.map((p) => {
              const xPct = (p.x / 100) * 100;
              const yPct = 100 - (Math.log10(Math.max(1, p.volume)) / Math.log10(Math.max(2, maxVol))) * 100;
              const r = 6 + (p.opportunity / 100) * 14;
              const isHover = hovered === p.id;
              return (
                <g key={p.id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx={`${xPct}%`}
                          cy={`${yPct}%`}
                          r={r}
                          fill={color(p.opportunity)}
                          fillOpacity={isHover ? 0.9 : 0.55}
                          stroke={color(p.opportunity)}
                          strokeWidth={isHover ? 2 : 1}
                          style={{ cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={() => setHovered(p.id)}
                          onMouseLeave={() => setHovered(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <div className="font-semibold">{p.keyword}</div>
                        <div className="text-muted-foreground mt-0.5">
                          Vol {formatNumber(p.volume)} · Diff {p.difficulty.toFixed(0)} · Pos #{p.position}
                        </div>
                        <div className="font-semibold mt-0.5" style={{ color: color(p.opportunity) }}>
                          Opportunity: {p.opportunity}/100
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </g>
              );
            })}
          </svg>

          {/* Axis labels */}
          <div className="absolute bottom-1 left-2 text-[10px] text-muted-foreground">Easy</div>
          <div className="absolute bottom-1 right-2 text-[10px] text-muted-foreground">Hard</div>
          <div className="absolute top-2 right-2 text-[10px] text-muted-foreground [writing-mode:vertical-rl] rotate-180">High volume</div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />High opp (70+)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Medium (50-69)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Low (30-49)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />Minimal</span>
          </div>
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {points.filter((p) => p.opportunity >= 70).length} high-opportunity keywords found
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
