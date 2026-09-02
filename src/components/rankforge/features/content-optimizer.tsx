"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, CheckCircle2, AlertTriangle, TrendingUp, Lightbulb, Hash, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Analysis = {
  contentScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{ title: string; detail: string; priority: string; impact: string }>;
  keywordDensity: string;
  readabilityScore: number;
  wordCountTarget: number;
  suggestedHeadings: string[];
};

type OptimizeData = {
  pageTitle: string;
  pageMetaDesc: string;
  wordCount: number;
  headings: string[];
  analysis: Analysis;
};

export function ContentOptimizer({ token }: { token: string }) {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OptimizeData | null>(null);
  const { toast } = useToast();

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const r = await fetch(`/api/client/${token}/optimize-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: url.trim(), targetKeyword: keyword.trim() }),
      });
      if (!r.ok) throw new Error("Failed");
      const j = await r.json();
      setData(j);
      toast({ title: "Content analyzed!", description: `Content score: ${j.analysis.contentScore}/100` });
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    high: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    low: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          Content Optimizer
        </CardTitle>
        <CardDescription>Paste any URL — AI analyzes the content &amp; suggests SEO improvements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Page URL to analyze</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com/blog/post" className="h-9" />
          </div>
          <div className="w-40 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Target keyword (optional)</Label>
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="best running shoes" className="h-9" />
          </div>
          <Button onClick={analyze} disabled={loading || !url.trim()} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5 self-end h-9">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Analyze
          </Button>
        </div>

        {loading && (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Fetching page &amp; AI-analyzing content…</p>
          </div>
        )}

        <AnimatePresence>
          {data && !loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Page info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Content Score</div>
                  <div className={cn("text-2xl font-bold tabular-nums", data.analysis.contentScore >= 75 ? "text-emerald-600 dark:text-emerald-400" : data.analysis.contentScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>{data.analysis.contentScore}</div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Readability</div>
                  <div className="text-2xl font-bold tabular-nums">{data.analysis.readabilityScore}</div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current Words</div>
                  <div className="text-2xl font-bold tabular-nums">{data.wordCount}</div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Target Words</div>
                  <div className="text-2xl font-bold tabular-nums text-primary">{data.analysis.wordCountTarget}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">AI Assessment</div>
                <p className="text-sm leading-relaxed">{data.analysis.summary}</p>
              </div>

              {/* Strengths + Weaknesses */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                  </div>
                  <ul className="space-y-1">
                    {data.analysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5"><span className="text-emerald-500 shrink-0">✓</span>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" /> Weaknesses
                  </div>
                  <ul className="space-y-1">
                    {data.analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5"><span className="text-rose-500 shrink-0">✗</span>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 rf-section-heading">Recommendations</div>
                <div className="space-y-2">
                  {data.analysis.recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{rec.title}</span>
                            <Badge variant="outline" className={cn("text-[9px] capitalize", priorityColors[rec.priority])}>{rec.priority}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.detail}</p>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-3 w-3" />
                            {rec.impact}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Suggested headings */}
              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  <Hash className="h-3.5 w-3.5" /> Suggested Heading Structure
                </div>
                <div className="space-y-1">
                  {data.analysis.suggestedHeadings.map((h, i) => (
                    <div key={i} className="text-xs font-mono text-muted-foreground">{h}</div>
                  ))}
                </div>
              </div>

              {/* Keyword density */}
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <span className="font-semibold text-muted-foreground">Keyword Density:</span> {data.analysis.keywordDensity}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
