"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Backlink } from "@/lib/seo/types";
import { useMemo, useState } from "react";
import { Cloud, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnchorCloud({ backlinks }: { backlinks: Backlink[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const anchors = useMemo(() => {
    const map = new Map<string, { count: number; totalDA: number; dofollow: number }>();
    for (const b of backlinks) {
      const a = b.anchorText || "(empty)";
      if (!map.has(a)) map.set(a, { count: 0, totalDA: 0, dofollow: 0 });
      const e = map.get(a)!;
      e.count++;
      e.totalDA += b.domainAuthority;
      if (b.linkType === "dofollow") e.dofollow++;
    }
    return Array.from(map.entries())
      .map(([text, v]) => ({
        text,
        count: v.count,
        avgDA: v.totalDA / v.count,
        dofollowPct: (v.dofollow / v.count) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 24);
  }, [backlinks]);

  const maxCount = Math.max(...anchors.map((a) => a.count), 1);

  const fontSize = (count: number) => {
    const ratio = count / maxCount;
    return 12 + ratio * 26; // 12px to 38px
  };

  const color = (dofollowPct: number) => {
    if (dofollowPct >= 70) return "#10b981";
    if (dofollowPct >= 50) return "#14b8a6";
    if (dofollowPct >= 30) return "#f59e0b";
    return "#94a3b8";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-primary" />
          Backlink Anchor-Text Cloud
        </CardTitle>
        <CardDescription>
          Top {anchors.length} anchor texts · size = frequency · color = dofollow ratio · hover for details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-muted/20 p-6 min-h-[280px] flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          {anchors.length === 0 ? (
            <div className="text-sm text-muted-foreground">No backlinks to analyze.</div>
          ) : (
            anchors.map((a) => (
              <button
                key={a.text}
                onMouseEnter={() => setHovered(a.text)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "relative font-semibold transition-all hover:scale-110",
                  hovered && hovered !== a.text && "opacity-30"
                )}
                style={{
                  fontSize: fontSize(a.count),
                  color: color(a.dofollowPct),
                  textShadow: hovered === a.text ? `0 0 16px ${color(a.dofollowPct)}66` : "none",
                }}
              >
                {a.text}
                {hovered === a.text && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
                    {a.count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />70%+ dofollow</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" />50-69%</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />30-49%</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />Low</span>
          </div>
          <div className="text-muted-foreground inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {anchors.length} unique anchors across {backlinks.length} backlinks
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
