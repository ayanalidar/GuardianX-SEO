"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Bot, Sparkles, Loader2, FileText, ListChecks, Link2, Tag, Target, ArrowRight, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Brief = {
  id: string;
  keyword: string;
  title: string;
  metaDescription: string;
  wordCount: number;
  outline: string;
  relatedEntities: string;
  internalLinks: string;
};

export function ContentBriefGenerator({ companyId }: { companyId: string }) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setBrief(null);
    try {
      const r = await fetch(`/api/companies/${companyId}/briefs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      if (!r.ok) throw new Error("Generation failed");
      const j = await r.json();
      setBrief(j.brief);
      toast({ title: "Content brief generated!", description: `Ready for "${keyword}"` });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyBrief = () => {
    if (!brief) return;
    const outline = safeParse(brief.outline);
    const entities = safeParse(brief.relatedEntities);
    const links = safeParse(brief.internalLinks);
    const text = `CONTENT BRIEF: ${brief.keyword}\n\nTitle: ${brief.title}\nMeta: ${brief.metaDescription}\nTarget words: ${brief.wordCount}\n\nOUTLINE:\n${outline.map((o: string, i: number) => `${i + 1}. ${o}`).join("\n")}\n\nRELATED ENTITIES: ${entities.join(", ")}\n\nINTERNAL LINKS:\n${links.map((l: string) => `- ${l}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Brief copied to clipboard!" });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative rf-hero-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Bot className="h-4 w-4" />
            </span>
            AI Content Brief Generator
          </CardTitle>
          <CardDescription>Enter a target keyword — get a full content brief with outline, entities & internal-link suggestions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="e.g. best running shoes for beginners"
              className="h-11"
            />
            <Button
              onClick={generate}
              disabled={loading || !keyword.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5 h-11 px-5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating…" : "Generate"}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {loading && !brief && (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">
                Analyzing keyword, competitors &amp; search intent…
              </p>
            </div>
          )}

          {brief && (
            <div className="space-y-4">
              {/* Title & meta */}
              <div className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">SEO Title</div>
                    <div className="font-semibold mt-0.5">{brief.title}</div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                    <Target className="h-3 w-3 mr-1" />
                    {brief.wordCount} words
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Meta Description</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{brief.metaDescription}</div>
                </div>
              </div>

              {/* Outline */}
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Content Outline</span>
                </div>
                <ol className="space-y-2">
                  {safeParse(brief.outline).map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Related entities */}
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-semibold">Related Entities</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {safeParse(brief.relatedEntities).map((e: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400">{e}</Badge>
                    ))}
                  </div>
                </div>

                {/* Internal links */}
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="h-4 w-4 text-teal-500" />
                    <span className="text-sm font-semibold">Suggested Internal Links</span>
                  </div>
                  <ul className="space-y-1.5">
                    {safeParse(brief.internalLinks).map((l: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs">
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-mono truncate">{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button variant="outline" onClick={copyBrief} className="w-full gap-1.5">
                <Copy className="h-3.5 w-3.5" />
                Copy full brief
              </Button>
            </div>
          )}

          {!brief && !loading && !error && (
            <div className="py-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Enter a keyword above to generate a data-driven content brief.
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

function safeParse(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const p = JSON.parse(s);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
