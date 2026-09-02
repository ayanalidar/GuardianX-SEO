"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFetch } from "@/lib/seo/hooks";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Copy, Check, Code2, FileText, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Fix = {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  language: string;
  code: string;
  instructions: string;
};

const severityConfig: Record<string, { bg: string; label: string }> = {
  high: { bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", label: "High Priority" },
  medium: { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Medium Priority" },
  low: { bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400", label: "Low Priority" },
};

const typeIcons: Record<string, typeof Code2> = {
  schema: Code2,
  meta: FileText,
  config: Settings,
};

export function AutoFixGenerator({ token }: { token: string }) {
  const { data, loading } = useFetch<{ fixes: Fix[] }>(`/api/client/${token}/autofix`);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const copyFix = (fix: Fix) => {
    navigator.clipboard.writeText(fix.code);
    setCopiedId(fix.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Code copied!", description: fix.title });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Auto-Fix Generator
        </CardTitle>
        <CardDescription>Ready-to-paste code snippets that fix your SEO issues — just copy &amp; paste into your site</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Generating fix code snippets…</p>
          </div>
        ) : data?.fixes ? (
          <div className="space-y-3">
            {data.fixes.map((fix, i) => {
              const Icon = typeIcons[fix.type] ?? Code2;
              const sev = severityConfig[fix.severity] ?? severityConfig.medium;
              return (
                <motion.div
                  key={fix.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border bg-card overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{fix.title}</span>
                          <Badge variant="outline" className={cn("text-[9px]", sev.bg)}>{sev.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{fix.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={copiedId === fix.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => copyFix(fix)}
                      className="gap-1.5 shrink-0"
                    >
                      {copiedId === fix.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === fix.id ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  {/* Code block */}
                  <pre className="max-h-48 overflow-auto rf-scroll bg-muted/40 border-t p-3 text-[11px] leading-relaxed font-mono">
                    <code>{fix.code}</code>
                  </pre>
                  {/* Instructions */}
                  <div className="px-4 py-2 bg-muted/20 border-t text-xs text-muted-foreground">
                    <span className="font-medium">How to use:</span> {fix.instructions}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">Failed to load fixes.</div>
        )}
      </CardContent>
    </Card>
  );
}
