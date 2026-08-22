"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  accent = "var(--primary)",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  sub?: string;
  accent?: string;
}) {
  const hasDelta = typeof delta === "number";
  const positive = hasDelta && delta! > 0;
  const negative = hasDelta && delta! < 0;
  const TrendIcon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  return (
    <Card className="p-4 gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
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
        {hasDelta && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              positive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              negative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              !positive && !negative && "bg-muted text-muted-foreground"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(delta!).toFixed(1)}%
          </div>
        )}
      </div>
    </Card>
  );
}
