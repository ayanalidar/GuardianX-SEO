"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  accent = "var(--primary)",
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  delta?: number;
  sub?: string;
  accent?: string;
  progress?: number; // 0-100, shows a thin progress bar at the bottom
}) {
  const hasDelta = typeof delta === "number";
  const positive = hasDelta && delta! > 0;
  const negative = hasDelta && delta! < 0;
  const TrendIcon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  return (
    <Card className="group relative p-4 gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden rf-gradient-border rf-glass-card">
      {/* subtle accent glow on hover */}
      <div
        className="absolute -top-8 -right-8 h-20 w-20 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-center justify-between relative">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="h-4 w-4" />
        </motion.span>
      </div>
      <div className="flex items-end justify-between gap-2 relative">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold tabular-nums rf-flip-in"
          >
            {value}
          </motion.div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
        </div>
        {hasDelta && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              positive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              negative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              !positive && !negative && "bg-muted text-muted-foreground"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(delta!).toFixed(1)}%
          </motion.div>
        )}
      </div>
      {typeof progress === "number" && (
        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>
      )}
    </Card>
  );
}
