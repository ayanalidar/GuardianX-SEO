"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNav } from "@/store/nav";
import { useFetch } from "@/lib/seo/hooks";
import { DomainWithCompanies } from "@/lib/seo/types";
import {
  Search, Rocket, Home, Grid3x3, Shield, LogIn, GitCompare,
  UserPlus, ArrowRight, CornerDownLeft, Building2, TrendingUp,
  Zap, Bell, Bot, Activity, KeyRound, Link2, Gauge, Layers,
  Target, Lightbulb, Map as MapIcon, Network, Grid3X3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Action = {
  id: string;
  label: string;
  group: string;
  icon: typeof Search;
  keywords: string[];
  run: () => void;
};

export function CommandPalette({
  domains,
}: {
  domains: DomainWithCompanies[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevOpen, setPrevOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset query/active when opening (render-phase adjustment)
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIdx(0);
    }
  }

  const nav = useNav();
  const allCompanies = useMemo(
    () => domains.flatMap((d) => d.companies.map((c) => ({ ...c, domainSlug: d.slug, domainName: d.name, domainAccent: d.accent, domainIcon: d.icon }))),
    [domains]
  );

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (open) {
        if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, 0)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
        if (e.key === "Escape") setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Build actions
  const actions: Action[] = useMemo(() => {
    const base: Action[] = [
      { id: "home", label: "Go to Home", group: "Navigation", icon: Home, keywords: ["home", "landing", "marketing"], run: () => nav.setMarketingPage("home") },
      { id: "industries", label: "Go to Industries", group: "Navigation", icon: Grid3x3, keywords: ["industries", "domains"], run: () => nav.setMarketingPage("industries") },
      { id: "capabilities", label: "Go to Capabilities", group: "Navigation", icon: Shield, keywords: ["capabilities", "features"], run: () => nav.setMarketingPage("capabilities") },
      { id: "auth", label: "Login / Sign up", group: "Navigation", icon: LogIn, keywords: ["login", "signup", "auth", "account"], run: () => nav.setMarketingPage("auth") },
      { id: "dashboard", label: "Launch Dashboard", group: "Navigation", icon: Rocket, keywords: ["dashboard", "app", "overview"], run: () => nav.enterApp() },
      { id: "onboard", label: "Onboard a Client", group: "Actions", icon: UserPlus, keywords: ["onboard", "client", "new", "create"], run: () => nav.setOnboarding(true) },
      { id: "compare", label: "Compare Companies", group: "Actions", icon: GitCompare, keywords: ["compare", "comparison"], run: () => { nav.enterApp(); setTimeout(() => nav.toggleCompareMode(), 100); } },
      { id: "notifications", label: "View Notifications", group: "Actions", icon: Bell, keywords: ["notifications", "alerts"], run: () => nav.enterApp() },
    ];
    const companyActions: Action[] = allCompanies.slice(0, 50).map((c) => ({
      id: `company-${c.id}`,
      label: `Open ${c.name}`,
      group: "Companies",
      icon: Building2,
      keywords: [c.name.toLowerCase(), c.website, c.industry?.toLowerCase(), c.domainName?.toLowerCase()].filter(Boolean) as string[],
      run: () => nav.openCompany(c.id, c.slug, c.domainSlug),
    }));
    return [...base, ...companyActions];
  }, [allCompanies, nav]);

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter((a) =>
      a.label.toLowerCase().includes(q) || a.keywords.some((k) => k.includes(q)) || a.group.toLowerCase().includes(q)
    );
  }, [actions, query]);

  // Group filtered actions
  const grouped = useMemo(() => {
    const map = new Map<string, Action[]>();
    for (const a of filtered) {
      if (!map.has(a.group)) map.set(a.group, []);
      map.get(a.group)!.push(a);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Flatten for keyboard nav
  const flat = filtered;

  const execute = (a: Action) => {
    a.run();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden top-[15%] translate-y-0">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, flat.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter" && flat[activeIdx]) { e.preventDefault(); execute(flat[activeIdx]); }
            }}
            placeholder="Type a command, company, or page…"
            className="border-0 shadow-none focus-visible:ring-0 h-12 text-base"
          />
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto rf-scroll p-2">
          {flat.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-2">
                <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {group}
                </div>
                {items.map((a) => {
                  const idx = flat.indexOf(a);
                  const active = idx === activeIdx;
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => execute(a)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{a.label}</span>
                      {active && <CornerDownLeft className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><kbd className="rounded border bg-muted px-1 py-0.5">↑↓</kbd> navigate</span>
            <span className="inline-flex items-center gap-1"><kbd className="rounded border bg-muted px-1 py-0.5">↵</kbd> select</span>
          </div>
          <span>{flat.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
