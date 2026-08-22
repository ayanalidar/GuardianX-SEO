"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNav } from "@/store/nav";
import { useEffect, useState } from "react";
import {
  Search, Globe, TrendingUp, Hash, Rocket, Home, Grid3x3,
  Shield, GitCompare, UserPlus, Clock, ArrowRight, CornerDownLeft,
} from "lucide-react";
import { formatNumber } from "@/lib/seo/hooks";
import { useSavedViews } from "@/store/saved-views";
import { cn } from "@/lib/utils";

type SearchResult = {
  results: {
    companies: Array<{
      id: string;
      name: string;
      website: string;
      industry: string;
      domainName: string;
      domainSlug: string;
      domainColor: string;
    }>;
    keywords: Array<{
      companyId: string;
      companyName: string;
      domainName: string;
      domainColor: string;
      keyword: string;
      position: number;
      searchVolume: number;
    }>;
  };
};

const QUICK_ACTIONS = [
  { label: "Launch Dashboard", icon: Rocket, action: "dashboard", hint: "Go to overview" },
  { label: "Onboard a Client", icon: UserPlus, action: "onboard", hint: "Create new client portal" },
  { label: "Compare Companies", icon: GitCompare, action: "compare", hint: "Side-by-side analysis" },
  { label: "Industries", icon: Grid3x3, action: "industries", hint: "View all domains" },
  { label: "Capabilities", icon: Shield, action: "capabilities", hint: "Feature overview" },
  { label: "Home", icon: Home, action: "home", hint: "Marketing landing" },
] as const;

export function SearchDialog() {
  const open = useNav((s) => s.searchOpen);
  const setOpen = useNav((s) => s.setSearchOpen);
  const openCompany = useNav((s) => s.openCompany);
  const enterApp = useNav((s) => s.enterApp);
  const setMarketingPage = useNav((s) => s.setMarketingPage);
  const setOnboarding = useNav((s) => s.setOnboarding);
  const toggleCompareMode = useNav((s) => s.toggleCompareMode);
  const savedViews = useSavedViews((s) => s.views);
  const [q, setQ] = useState("");
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevQ, setPrevQ] = useState("");

  // Render-phase adjustment when q changes
  if (prevQ !== q) {
    setPrevQ(q);
    if (!q.trim()) {
      setLoading(false);
      setData(null);
    } else {
      setLoading(true);
    }
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQ("");
      setData(null);
    }
  };

  const runAction = (action: string) => {
    switch (action) {
      case "dashboard": enterApp(); break;
      case "onboard": setOnboarding(true); break;
      case "compare": enterApp(); setTimeout(() => toggleCompareMode(), 100); break;
      case "industries": setMarketingPage("industries"); break;
      case "capabilities": setMarketingPage("capabilities"); break;
      case "home": setMarketingPage("home"); break;
    }
    setOpen(false);
  };

  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    let active = true;
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => {
          if (active) {
            setData(d);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  const hasResults = data && (data.results.companies.length > 0 || data.results.keywords.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden top-[15%] translate-y-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search RankForge</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies, keywords, or try an action…"
            className="border-0 shadow-none focus-visible:ring-0 h-12 text-base"
          />
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto rf-scroll">
          {/* Empty state: quick actions + recent/saved views */}
          {!q.trim() && (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Actions
              </div>
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.action}
                    onClick={() => runAction(a.action)}
                    className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors text-left"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{a.label}</div>
                      <div className="text-xs text-muted-foreground">{a.hint}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}

              {/* Saved views as recents */}
              {savedViews.length > 0 && (
                <>
                  <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Recent / Saved
                  </div>
                  {savedViews.slice(0, 5).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        openCompany(v.companyId, v.companySlug, v.domainSlug);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors text-left"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{v.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{v.domainSlug}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {q.trim() && loading && (
            <div className="p-8 text-center text-sm text-muted-foreground">Searching…</div>
          )}
          {q.trim() && data && !hasResults && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No matches for “{q}”.
            </div>
          )}
          {data && data.results.companies.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Companies
              </div>
              {data.results.companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    openCompany(c.id, c.name.toLowerCase().replace(/\s+/g, "-"), c.domainSlug);
                    setOpen(false);
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors text-left"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: `var(--color-${c.domainColor}, var(--primary))` }}
                  >
                    <Globe className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.industry} · {c.website}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{c.domainName}</span>
                </button>
              ))}
            </div>
          )}
          {data && data.results.keywords.length > 0 && (
            <div className="p-2 border-t">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Keywords
              </div>
              {data.results.keywords.map((k, i) => (
                <button
                  key={i}
                  onClick={() => {
                    openCompany(k.companyId, k.companyName.toLowerCase().replace(/\s+/g, "-"), "");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors text-left"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Hash className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{k.keyword}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {k.companyName} · {k.domainName}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-muted-foreground">{formatNumber(k.searchVolume)} vol</span>
                    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <TrendingUp className="h-3 w-3" />
                      #{k.position}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><kbd className="rounded border bg-muted px-1 py-0.5">↵</kbd> open</span>
            <span className="inline-flex items-center gap-1"><kbd className="rounded border bg-muted px-1 py-0.5">esc</kbd> close</span>
          </div>
          <span>Powered by RankForge</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
