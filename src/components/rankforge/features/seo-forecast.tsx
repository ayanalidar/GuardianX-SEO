"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/seo/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Sparkles, TrendingUp, TrendingDown, Activity, KeyRound,
  Gauge, Eye, AlertTriangle, Lightbulb, Target, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Forecast = {
  current: { traffic: number; keywords: number; position: number; authority: number };
  forecast30: { traffic: number; keywords: number; position: number; authority: number };
  forecast60: { traffic: number; keywords: number; position: number; authority: number };
  forecast90: { traffic: number; keywords: number; position: number; authority: number };
  narrative: {
    summary: string;
    confidence: string;
    keyDrivers: string[];
    risks: string[];
    recommendations: string[];
  };
};

const confidenceConfig: Record<string, { color: string; bg: string }> = {
  high: { color: "#10b981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  medium: { color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  low: { color: "#f43f5e", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

export function SeoForecast({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    setError(null);
    setForecast(null);
    try {
      const r = await fetch(`/api/companies/${companyId}/forecast`, { method: "POST" });
      if (!r.ok) throw new Error("Failed");
      const j = await r.json();
      setForecast(j);
      toast({ title: "Forecast generated!", description: "90-day projection ready." });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { key: "forecast30", label: "30 days", days: 30 },
    { key: "forecast60", label: "60 days", days: 60 },
    { key: "forecast90", label: "90 days", days: 90 },
  ] as const;

  const metricRows = [
    { key: "traffic", label: "Organic Traffic", icon: Activity, color: "#10b981", invert: false },
    { key: "keywords", label: "Keywords Ranked", icon: KeyRound, color: "#14b8a6", invert: false },
    { key: "position", label: "Avg Position", icon: Gauge, color: "#f59e0b", invert: true },
    { key: "authority", label: "Domain Authority", icon: TrendingUp, color: "#8b5cf6", invert: false },
  ] as const;

  return (
    <Card className="overflow-hidden">
      <div className="relative rf-hero-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <TrendingUp className="h-4 w-4" />
            </span>
            SEO Forecasting
          </CardTitle>
          <CardDescription>AI-powered 30/60/90-day projections based on your trend data</CardDescription>
        </CardHeader>
        <CardContent>
          {!forecast && !loading && (
            <div className="py-10 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Generate a data-driven forecast projecting traffic, keywords, position & authority.
              </p>
              <Button onClick={generate} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5">
                <Sparkles className="h-4 w-4" />
                Generate Forecast
              </Button>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing 30-day trends & generating forecast…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <AnimatePresence>
            {forecast && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Confidence + summary */}
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">AI Forecast Summary</span>
                    </div>
                    <Badge className={cn("border-0 capitalize", confidenceConfig[forecast.narrative.confidence]?.bg ?? confidenceConfig.medium.bg)}>
                      {forecast.narrative.confidence} confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{forecast.narrative.summary}</p>
                </div>

                {/* Projection table */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="grid grid-cols-5 bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <div className="px-3 py-2">Metric</div>
                    <div className="px-3 py-2 text-right">Now</div>
                    <div className="px-3 py-2 text-right">+30d</div>
                    <div className="px-3 py-2 text-right">+60d</div>
                    <div className="px-3 py-2 text-right">+90d</div>
                  </div>
                  {metricRows.map((m) => {
                    const Icon = m.icon;
                    const cur = forecast.current[m.key];
                    const f90 = forecast.forecast90[m.key];
                    const positive = m.invert ? f90 < cur : f90 > cur;
                    const deltaPct = m.key === "position"
                      ? ((f90 - cur) / Math.max(1, cur)) * 100
                      : ((f90 - cur) / Math.max(1, cur)) * 100;
                    return (
                      <div key={m.key} className="grid grid-cols-5 items-center border-t">
                        <div className="px-3 py-2.5 flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                          <span className="text-xs font-medium">{m.label}</span>
                        </div>
                        <div className="px-3 py-2.5 text-right text-sm font-bold tabular-nums">{formatNumber(cur)}</div>
                        <div className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">{formatNumber(forecast.forecast30[m.key])}</div>
                        <div className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">{formatNumber(forecast.forecast60[m.key])}</div>
                        <div className="px-3 py-2.5 text-right">
                          <span className="text-sm font-bold tabular-nums" style={{ color: positive ? "#10b981" : "#f43f5e" }}>
                            {formatNumber(f90)}
                          </span>
                          <span className={cn("ml-1 text-[10px] font-semibold", positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {deltaPct >= 0 ? "+" : ""}{deltaPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Key drivers + risks + recommendations */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key Drivers</span>
                    </div>
                    <ul className="space-y-1.5">
                      {forecast.narrative.keyDrivers.map((d, i) => (
                        <li key={i} className="text-xs flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Risks</span>
                    </div>
                    <ul className="space-y-1.5">
                      {forecast.narrative.risks.map((r, i) => (
                        <li key={i} className="text-xs flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommendations</span>
                    </div>
                    <ul className="space-y-1.5">
                      {forecast.narrative.recommendations.map((r, i) => (
                        <li key={i} className="text-xs flex items-start gap-1.5">
                          <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button variant="outline" onClick={generate} disabled={loading} className="w-full gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Regenerate forecast
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </div>
    </Card>
  );
}
