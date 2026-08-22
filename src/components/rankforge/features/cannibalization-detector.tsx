"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Keyword } from "@/lib/seo/types";
import { useMemo } from "react";
import { AlertTriangle, Search, ExternalLink, GitBranch } from "lucide-react";
import { formatNumber } from "@/lib/seo/hooks";

export function CannibalizationDetector({ keywords }: { keywords: Keyword[] }) {
  const { groups, totalCannibalized } = useMemo(() => {
    // Group by keyword text — if the same keyword appears multiple times with different URLs => cannibalization
    const byKw = new Map<string, Keyword[]>();
    for (const k of keywords) {
      if (!byKw.has(k.keyword)) byKw.set(k.keyword, []);
      byKw.get(k.keyword)!.push(k);
    }
    const cannibalized = Array.from(byKw.entries())
      .filter(([, ks]) => {
        if (ks.length < 2) return false;
        const urls = new Set(ks.map((k) => k.url));
        return urls.size > 1; // different URLs targeting same keyword
      })
      .map(([kw, ks]) => ({
        keyword: kw,
        urls: Array.from(new Set(ks.map((k) => k.url))),
        entries: ks.sort((a, b) => a.position - b.position),
        bestPos: Math.min(...ks.map((k) => k.position)),
        totalVol: ks[0].searchVolume,
      }))
      .sort((a, b) => b.totalVol - a.totalVol);
    return { groups: cannibalized, totalCannibalized: cannibalized.length };
  }, [keywords]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          Keyword Cannibalization Detector
        </CardTitle>
        <CardDescription>
          Keywords where multiple of your pages compete for the same SERP
          {totalCannibalized > 0 && (
            <span className="text-amber-600 dark:text-amber-400 ml-1">· {totalCannibalized} detected</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {totalCannibalized === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No cannibalization detected</p>
            <p className="text-xs text-muted-foreground mt-1">All tracked keywords map to unique URLs. Healthy structure!</p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto rf-scroll">
            {groups.map((g, i) => (
              <div key={i} className="border-b last:border-b-0 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-sm truncate">{g.keyword}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {g.entries.map((e, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span
                            className={`inline-flex min-w-7 justify-center rounded px-1.5 py-0.5 font-bold tabular-nums ${
                              idx === 0
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            #{e.position}
                          </span>
                          <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-mono text-muted-foreground hover:text-primary truncate flex items-center gap-1">
                            {e.url.replace(/^https?:\/\//, "").slice(0, 50)}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                          {idx === 0 && <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/30">Winner</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="font-bold tabular-nums">{formatNumber(g.totalVol)}</div>
                  </div>
                </div>
                <div className="mt-2 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                  ⚠ {g.urls.length} pages compete for this keyword. Consider consolidating or 301-redirecting weaker pages to the winner.
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
