"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFetch } from "@/lib/seo/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  Wand2, Copy, Check, Zap, Globe, Loader2, ArrowRight,
  Shield, Rocket, CheckCircle2, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AutoOptimizer({ token }: { token: string }) {
  const { data, loading } = useFetch<{ script: string; features: any[]; howItWorks: string[]; instructions: string[] }>(
    `/api/client/${token}/auto-optimize`
  );
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyScript = () => {
    if (!data?.script) return;
    navigator.clipboard.writeText(data.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Auto-optimizer script copied!", description: "Paste it before </body> on your website." });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative rf-hero-glow">
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                  <Wand2 className="h-5 w-5" />
                </span>
                Auto-Optimizer
              </CardTitle>
              <CardDescription className="mt-1.5">
                One script tag that <strong>automatically fixes SEO</strong> on every page of your website — no code changes needed
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 gap-1">
              <Zap className="h-3 w-3" />
              Fully Automatic
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">Generating your auto-optimizer script…</p>
            </div>
          ) : data ? (
            <>
              {/* How it works */}
              <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">How it works</span>
                </div>
                <div className="space-y-1.5">
                  {data.howItWorks.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{i + 1}</span>
                      <span className="text-muted-foreground leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Script */}
              <div className="relative">
                <pre className="max-h-40 overflow-auto rf-scroll rounded-xl border bg-muted/40 p-4 text-[10px] leading-relaxed font-mono">
                  <code>{data.script}</code>
                </pre>
                <Button
                  variant={copied ? "default" : "outline"}
                  size="sm"
                  onClick={copyScript}
                  className="absolute top-3 right-3 gap-1.5"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Script"}
                </Button>
              </div>

              {/* Instructions */}
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Setup (30 seconds)</div>
                <div className="space-y-1">
                  {data.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features grid */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 rf-section-heading">
                  What it automatically fixes
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {data.features.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="text-lg mb-1">{f.icon}</div>
                      <div className="text-xs font-semibold">{f.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-4 text-center">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Result: Your website becomes SEO-ready automatically
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Google sees optimized meta tags, schema markup, fast loading, and proper heading structure — on every page, every visit.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">Failed to load.</div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
