"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFetch } from "@/lib/seo/hooks";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon, Bell, Bot, Link2, CheckCircle2,
  UserPlus, ArrowRight,
} from "lucide-react";
import { useNav } from "@/store/nav";

type Activity = {
  id: string;
  type: "alert" | "insight" | "backlink" | "resolved" | "onboarded";
  title: string;
  description: string;
  companyName: string;
  companyLogo: string;
  domainAccent: string;
  timestamp: string;
};

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  alert: { icon: Bell, color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Alert" },
  insight: { icon: Bot, color: "#ec4899", bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400", label: "AI Insight" },
  backlink: { icon: Link2, color: "#8b5cf6", bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400", label: "Backlink" },
  resolved: { icon: CheckCircle2, color: "#10b981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Resolved" },
  onboarded: { icon: UserPlus, color: "#0ea5e9", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400", label: "Onboarded" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ActivityFeed() {
  const { data, loading } = useFetch<{ activities: Activity[] }>("/api/activity");
  const enterApp = useNav((s) => s.enterApp);
  const activities = data?.activities ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-primary" />
          Activity Feed
        </CardTitle>
        <CardDescription>Recent changes across all tracked companies</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No recent activity.
          </div>
        ) : (
          <div className="max-h-[460px] overflow-y-auto rf-scroll">
            {activities.map((a, i) => {
              const cfg = typeConfig[a.type] ?? typeConfig.alert;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group flex items-start gap-3 border-b last:border-b-0 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => enterApp()}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-snug truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-white"
                        style={{ backgroundColor: a.domainAccent }}
                      >
                        {a.companyLogo}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{a.companyName}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(a.timestamp)}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
