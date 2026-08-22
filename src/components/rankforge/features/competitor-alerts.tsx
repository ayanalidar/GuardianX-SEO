"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompetitorAlert } from "@/lib/seo/types";
import { useState, useEffect } from "react";
import { Bell, AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown, FileText, Link2, Layers, Trophy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const typeConfig: Record<string, { icon: typeof TrendingUp; color: string }> = {
  "rank-gain": { icon: TrendingUp, color: "#10b981" },
  "rank-loss": { icon: TrendingDown, color: "#f43f5e" },
  "new-content": { icon: FileText, color: "#0ea5e9" },
  "backlink-surge": { icon: Link2, color: "#8b5cf6" },
  "feature-captured": { icon: Layers, color: "#ec4899" },
  "feature-lost": { icon: Trophy, color: "#f59e0b" },
};

const severityConfig: Record<string, { bg: string; text: string; icon: typeof Info; label: string }> = {
  critical: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", icon: AlertTriangle, label: "Critical" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", icon: AlertCircle, label: "Warning" },
  info: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", icon: Info, label: "Info" },
};

export function CompetitorAlerts({ alerts, companyId }: { alerts: CompetitorAlert[]; companyId: string }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  const [localAlerts, setLocalAlerts] = useState(alerts);

  useEffect(() => { setLocalAlerts(alerts); }, [alerts]);

  const markRead = async (id: string) => {
    setLocalAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    // fire and forget
    fetch(`/api/companies/${companyId}/alerts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    }).catch(() => {});
  };

  const markAllRead = () => {
    setLocalAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    fetch(`/api/companies/${companyId}/alerts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true, read: true }),
    }).catch(() => {});
    toast({ title: "All alerts marked as read" });
  };

  const filtered = localAlerts.filter((a) => {
    if (filter === "unread") return !a.read;
    if (filter === "critical") return a.severity === "critical";
    return true;
  });

  const unreadCount = localAlerts.filter((a) => !a.read).length;
  const criticalCount = localAlerts.filter((a) => a.severity === "critical").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="relative">
                <Bell className="h-4 w-4 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </span>
              Competitor Alerts
            </CardTitle>
            <CardDescription>
              {localAlerts.length} alerts · {unreadCount} unread · {criticalCount} critical
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(["all", "unread", "critical"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors",
                    filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1 h-7 text-xs">
                <Check className="h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[520px] overflow-y-auto rf-scroll">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No alerts in this filter.</div>
          ) : (
            filtered.map((a, i) => {
              const tcfg = typeConfig[a.type] ?? { icon: Info, color: "#94a3b8" };
              const scfg = severityConfig[a.severity] ?? severityConfig.info;
              const TIcon = tcfg.icon;
              const SIcon = scfg.icon;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-start gap-3 border-b last:border-b-0 px-4 py-3 hover:bg-muted/30 transition-colors",
                    !a.read && "bg-primary/5"
                  )}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: `${tcfg.color}1a`, color: tcfg.color }}
                  >
                    <TIcon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-sm font-medium", !a.read && "font-semibold")}>{a.title}</span>
                      {!a.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={cn("text-[10px] gap-1", scfg.bg, scfg.text)}>
                        <SIcon className="h-3 w-3" />
                        {scfg.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{a.competitor}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  {!a.read && (
                    <button
                      onClick={() => markRead(a.id)}
                      className="shrink-0 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
