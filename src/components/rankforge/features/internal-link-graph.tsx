"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InternalLink } from "@/lib/seo/types";
import { useMemo, useState, useEffect, useRef } from "react";
import { Network, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Node = {
  id: string;
  label: string;
  url: string;
  depth: number;
  authority: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  inLinks: number;
  outLinks: number;
};

type Edge = {
  source: string;
  target: string;
  type: string;
};

const colorByDepth = (depth: number) => {
  if (depth === 0) return "#10b981";
  if (depth === 1) return "#14b8a6";
  if (depth === 2) return "#0ea5e9";
  return "#94a3b8";
};

export function InternalLinkGraph({ links }: { links: InternalLink[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const { nodes, edges, orphanIds } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];
    const W = 600;
    const H = 400;

    for (const l of links) {
      if (!nodeMap.has(l.sourceUrl)) {
        nodeMap.set(l.sourceUrl, {
          id: l.sourceUrl,
          label: l.sourceTitle,
          url: l.sourceUrl,
          depth: l.sourceDepth,
          authority: l.authority,
          x: W / 2 + (Math.random() - 0.5) * 200,
          y: H / 2 + (Math.random() - 0.5) * 150,
          vx: 0, vy: 0,
          inLinks: 0, outLinks: 0,
        });
      }
      if (!nodeMap.has(l.targetUrl)) {
        nodeMap.set(l.targetUrl, {
          id: l.targetUrl,
          label: l.targetTitle,
          url: l.targetUrl,
          depth: l.sourceDepth + 1,
          authority: l.authority,
          x: W / 2 + (Math.random() - 0.5) * 200,
          y: H / 2 + (Math.random() - 0.5) * 150,
          vx: 0, vy: 0,
          inLinks: 0, outLinks: 0,
        });
      }
      edgeList.push({ source: l.sourceUrl, target: l.targetUrl, type: l.linkType });
      nodeMap.get(l.sourceUrl)!.outLinks++;
      nodeMap.get(l.targetUrl)!.inLinks++;
    }
    const nodeList = Array.from(nodeMap.values());
    // identify orphans (0 in-links & 0 out-links, depth > 0)
    const orphanIds = new Set(nodeList.filter((n) => n.depth > 0 && n.inLinks === 0 && n.outLinks === 0).map((n) => n.id));
    return { nodes: nodeList, edges: edgeList, orphanIds };
  }, [links]);

  // Simple force simulation: repulsion + link attraction + centering
  useEffect(() => {
    if (nodes.length === 0) return;
    let raf = 0;
    const W = 600;
    const H = 400;
    const run = () => {
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = 800 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }
      // link attraction
      for (const e of edges) {
        const a = nodeMap.get(e.source);
        const b = nodeMap.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const target = 80;
        const force = (dist - target) * 0.04;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      // centering + apply velocity with damping
      for (const n of nodes) {
        n.vx += (W / 2 - n.x) * 0.01;
        n.vy += (H / 2 - n.y) * 0.01;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
        // bounds
        n.x = Math.max(30, Math.min(W - 30, n.x));
        n.y = Math.max(30, Math.min(H - 30, n.y));
      }
      setTick((t) => t + 1);
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    // stop after 2.5s
    const stop = setTimeout(() => cancelAnimationFrame(raf), 2500);
    return () => { cancelAnimationFrame(raf); clearTimeout(stop); };
  }, [nodes.length, edges.length]);

  const hoveredNode = hovered ? nodes.find((n) => n.id === hovered) : null;
  const connectedIds = new Set<string>();
  if (hoveredNode) {
    connectedIds.add(hoveredNode.id);
    for (const e of edges) {
      if (e.source === hovered) connectedIds.add(e.target);
      if (e.target === hovered) connectedIds.add(e.source);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          Internal Link Graph
        </CardTitle>
        <CardDescription>
          Force-directed visualization of your site&apos;s internal link structure · {nodes.length} pages · {edges.length} links
          {orphanIds.size > 0 && (
            <span className="text-amber-600 dark:text-amber-400 ml-1">· {orphanIds.size} orphan pages</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full rounded-xl border bg-muted/20 overflow-hidden" style={{ aspectRatio: "3/2" }}>
          <svg ref={svgRef} viewBox="0 0 600 400" className="w-full h-full">
            {/* edges */}
            {edges.map((e, i) => {
              const a = nodes.find((n) => n.id === e.source);
              const b = nodes.find((n) => n.id === e.target);
              if (!a || !b) return null;
              const dim = hovered && !connectedIds.has(e.source) && !connectedIds.has(e.target);
              return (
                <line
                  key={i}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={e.type === "dofollow" ? "#10b981" : "#94a3b8"}
                  strokeOpacity={dim ? 0.1 : 0.35}
                  strokeWidth={1}
                />
              );
            })}
            {/* nodes */}
            {nodes.map((n) => {
              const r = 5 + (n.authority / 100) * 12;
              const isOrphan = orphanIds.has(n.id);
              const dim = hovered && !connectedIds.has(n.id);
              const c = isOrphan ? "#f59e0b" : colorByDepth(n.depth);
              return (
                <g key={n.id} style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}>
                  <circle
                    cx={n.x} cy={n.y} r={r}
                    fill={c}
                    fillOpacity={dim ? 0.15 : hovered === n.id ? 0.95 : 0.6}
                    stroke={c}
                    strokeWidth={hovered === n.id ? 2.5 : isOrphan ? 2 : 1}
                    strokeDasharray={isOrphan ? "3 2" : undefined}
                  />
                  {(hovered === n.id || r > 10) && (
                    <text
                      x={n.x} y={n.y - r - 4}
                      textAnchor="middle"
                      className="fill-foreground"
                      style={{ fontSize: 9, fontWeight: 600, opacity: dim ? 0.3 : 1 }}
                    >
                      {n.label.length > 16 ? n.label.slice(0, 14) + "…" : n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {hoveredNode && (
            <div className="absolute bottom-3 left-3 right-3 rounded-lg border bg-popover/95 backdrop-blur p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{hoveredNode.label}</span>
                <span className="text-muted-foreground font-mono truncate max-w-[180px]">{hoveredNode.url}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-4 text-muted-foreground">
                <span>Authority <strong className="text-foreground">{hoveredNode.authority.toFixed(0)}</strong></span>
                <span>In <strong className="text-foreground">{hoveredNode.inLinks}</strong></span>
                <span>Out <strong className="text-foreground">{hoveredNode.outLinks}</strong></span>
                <span>Depth <strong className="text-foreground">{hoveredNode.depth}</strong></span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Homepage</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" />Depth 1</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" />Depth 2</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-amber-500" />Orphan</span>
          </div>
          <div className="text-muted-foreground inline-flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Hover nodes to see connections
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
