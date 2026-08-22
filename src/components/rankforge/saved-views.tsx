"use client";

import { useState, useRef, useEffect } from "react";
import { useSavedViews } from "@/store/saved-views";
import { useNav } from "@/store/nav";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkPlus, X, Clock, Building2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function SavedViewsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const views = useSavedViews((s) => s.views);
  const removeView = useSavedViews((s) => s.removeView);
  const clearAll = useSavedViews((s) => s.clearAll);
  const openCompany = useNav((s) => s.openCompany);
  const { toast } = useToast();

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
        aria-label="Saved views"
      >
        <Bookmark className="h-4 w-4" />
        {views.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {views.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-popover shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Saved Views</span>
                {views.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {views.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {views.length > 0 && (
                  <button
                    onClick={() => {
                      clearAll();
                      toast({ title: "All saved views cleared" });
                    }}
                    className="text-muted-foreground hover:text-rose-500 p-1"
                    aria-label="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto rf-scroll">
              {views.length === 0 ? (
                <div className="py-10 text-center">
                  <BookmarkPlus className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">No saved views yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">
                    Bookmark a company dashboard to quickly return to it later.
                  </p>
                </div>
              ) : (
                views.map((v) => (
                  <div
                    key={v.id}
                    className="group flex items-center gap-3 border-b last:border-b-0 px-4 py-2.5 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => {
                      openCompany(v.companyId, v.companySlug, v.domainSlug);
                      setOpen(false);
                    }}
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{v.label}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(v.createdAt)}
                        {v.tab && (
                          <>
                            <span>·</span>
                            <span className="capitalize">{v.tab}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeView(v.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-opacity p-1"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// A small "bookmark this view" button to place in the company detail header
export function BookmarkThisView({
  companyId,
  companySlug,
  domainSlug,
  label,
  tab,
}: {
  companyId: string;
  companySlug: string;
  domainSlug: string;
  label: string;
  tab?: string;
}) {
  const { hasView, addView, removeView } = useSavedViews();
  const { toast } = useToast();
  const saved = hasView(companyId, tab);

  const toggle = () => {
    if (saved) {
      // find and remove
      const all = useSavedViews.getState().views;
      const match = all.find((v) => v.companyId === companyId && v.tab === tab);
      if (match) removeView(match.id);
      toast({ title: "Removed from saved views" });
    } else {
      addView({ companyId, companySlug, domainSlug, label, tab });
      toast({ title: "Saved!", description: `${label} added to your views.` });
    }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        saved
          ? "bg-primary/10 text-primary border-primary/30"
          : "hover:bg-muted text-muted-foreground"
      )}
    >
      {saved ? <Bookmark className="h-3.5 w-3.5 fill-current" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
      {saved ? "Saved" : "Save view"}
    </button>
  );
}
