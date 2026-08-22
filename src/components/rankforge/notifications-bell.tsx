"use client";

import { useState, useRef, useEffect } from "react";
import { useFetch } from "@/lib/seo/hooks";
import { useNav } from "@/store/nav";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, AlertTriangle, Trophy, Clock, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Notification = {
  id: string;
  type: "alert" | "goal" | "task-overdue" | "new-company";
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  description: string;
  companyName: string;
  companyLogo: string;
  domainAccent: string;
  createdAt: string;
};

type NotifData = { notifications: Notification[]; unreadCount: number };

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  alert: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  goal: { icon: Trophy, color: "#10b981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "task-overdue": { icon: Clock, color: "#f43f5e", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  "new-company": { icon: UserPlus, color: "#0ea5e9", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const enterApp = useNav((s) => s.enterApp);
  const { toast } = useToast();
  const { data, loading } = useFetch<NotifData>("/api/notifications");

  const unread = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-popover shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unread > 0 && (
                  <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {unread} new
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto rf-scroll">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = typeConfig[n.type] ?? typeConfig.alert;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 border-b last:border-b-0 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => { enterApp(); setOpen(false); }}
                    >
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-snug">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-white"
                            style={{ backgroundColor: n.domainAccent }}
                          >
                            {n.companyLogo}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{n.companyName}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-4 py-2 text-center">
              <button
                onClick={() => { enterApp(); setOpen(false); }}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all in dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
