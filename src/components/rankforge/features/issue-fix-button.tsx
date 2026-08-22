"use client";

import { TechnicalIssue } from "@/lib/seo/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Wrench, ChevronDown, ChevronUp, ListChecks, TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type Fix = {
  summary: string;
  steps: string[];
  estimatedImpact: string;
  priority: string;
  resources: string[];
};

export function IssueFixButton({ issue, companyId }: { issue: TechnicalIssue; companyId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fix, setFix] = useState<Fix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    setError(null);
    setFix(null);
    setOpen(true);
    try {
      const r = await fetch(`/api/companies/${companyId}/issues/${issue.id}/fix`, {
        method: "POST",
      });
      if (!r.ok) throw new Error("Failed");
      const j = await r.json();
      setFix(j.fix);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      toast({ title: "Fix generation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="gap-1.5 text-xs h-7"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-primary" />}
          Get AI Fix
        </Button>
        {fix && !loading && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {open ? "Hide" : "Show"} fix
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && (loading || fix || error) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Analyzing issue & generating fix…
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-xs text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}
              {fix && !loading && (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</div>
                      <div className="text-sm mt-0.5">{fix.summary}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      <ListChecks className="h-3.5 w-3.5" />
                      Implementation Steps
                    </div>
                    <ol className="space-y-1.5">
                      {fix.steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{i + 1}</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estimated Impact</div>
                      <div className="text-sm mt-0.5">{fix.estimatedImpact}</div>
                    </div>
                  </div>
                  {fix.resources.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Resources</div>
                      <div className="flex flex-wrap gap-1.5">
                        {fix.resources.map((r, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] gap-1">
                            <ExternalLink className="h-2.5 w-2.5" />
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
