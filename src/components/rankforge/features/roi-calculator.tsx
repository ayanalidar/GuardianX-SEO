"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFetch, formatNumber, formatMoney } from "@/lib/seo/hooks";
import { AnimatedCounter } from "@/components/rankforge/motion";
import { DollarSign, TrendingUp, Users, Target, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

type ROIData = {
  traffic: number;
  conversionRate: number;
  aov: number;
  monthlyConversions: number;
  monthlyRevenue: number;
  prevRevenue: number;
  revenueDelta: number;
  projected90Revenue: number;
  adCostEquivalent: number;
  adSavings: number;
  roi: number;
  valuePerVisitor: number;
  monthlyAdSpend: number;
};

export function RoiCalculator({ token }: { token: string }) {
  const [cr, setCr] = useState("2.5");
  const [aov, setAov] = useState("85");
  const [spend, setSpend] = useState("0");
  const [debounced, setDebounced] = useState("");

  // Debounce inputs
  useEffect(() => {
    const t = setTimeout(() => setDebounced(`${cr}-${aov}-${spend}`), 400);
    return () => clearTimeout(t);
  }, [cr, aov, spend]);

  const { data, loading } = useFetch<ROIData>(
    `/api/client/${token}/roi?cr=${encodeURIComponent(cr)}&aov=${encodeURIComponent(aov)}&spend=${encodeURIComponent(spend)}`
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          ROI & Revenue Calculator
        </CardTitle>
        <CardDescription>See how your organic traffic translates to real business revenue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Inputs */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Conversion Rate (%)</Label>
            <Input type="number" step="0.1" value={cr} onChange={(e) => setCr(e.target.value)} className="h-9" placeholder="2.5" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Avg Order Value ($)</Label>
            <Input type="number" value={aov} onChange={(e) => setAov(e.target.value)} className="h-9" placeholder="85" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Monthly Ad Spend ($)</Label>
            <Input type="number" value={spend} onChange={(e) => setSpend(e.target.value)} className="h-9" placeholder="500" />
          </div>
        </div>

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Hero revenue number */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated Monthly Organic Revenue</div>
              <div className="mt-2 text-5xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                <AnimatedCounter value={data.monthlyRevenue} prefix="$" format={false} />
              </div>
              <div className="mt-2 text-sm">
                <span className={data.revenueDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                  {data.revenueDelta >= 0 ? "▲" : "▼"} {Math.abs(data.revenueDelta).toFixed(1)}% vs last month
                </span>
              </div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <RoiStat icon={Users} label="Monthly Conversions" value={formatNumber(data.monthlyConversions)} color="#0ea5e9" />
              <RoiStat icon={Target} label="Value per Visitor" value={formatMoney(data.valuePerVisitor)} color="#8b5cf6" />
              <RoiStat icon={TrendingUp} label="90-day Projection" value={formatMoney(data.projected90Revenue)} color="#10b981" />
              <RoiStat icon={Zap} label="ROI" value={data.roi > 0 ? `${data.roi}%` : "—"} color="#f59e0b" />
            </div>

            {/* Ad cost comparison */}
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Paid Traffic Cost Comparison</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Ad Cost Equivalent</div>
                  <div className="text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatMoney(data.adCostEquivalent)}</div>
                  <div className="text-[10px] text-muted-foreground">if you bought this traffic via Google Ads</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Your SEO Spend</div>
                  <div className="text-lg font-bold tabular-nums">{formatMoney(Number(spend) || 0)}</div>
                  <div className="text-[10px] text-muted-foreground">monthly investment</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Monthly Savings</div>
                  <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatMoney(Math.max(0, data.adSavings))}</div>
                  <div className="text-[10px] text-muted-foreground">vs paying for ads</div>
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400">
              <strong>Insight:</strong> Every 1% increase in your conversion rate would add{" "}
              <strong>{formatMoney(data.traffic * 0.01 * data.aov)}</strong> in monthly revenue without any additional traffic.
              Focus on conversion optimization alongside SEO for compounding returns.
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="py-8 text-center text-sm text-muted-foreground">Calculating ROI…</div>
        )}
      </CardContent>
    </Card>
  );
}

function RoiStat({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1a`, color }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1.5 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
