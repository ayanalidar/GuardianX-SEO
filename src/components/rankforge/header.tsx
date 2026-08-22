"use client";

import { Button } from "@/components/ui/button";
import { Search, Sun, Moon, Rocket, Command, GitCompare, UserPlus } from "lucide-react";
import { useTheme } from "next-themes";
import { useNav } from "@/store/nav";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "./notifications-bell";

export function Header() {
  const { setTheme } = useTheme();
  const setSearchOpen = useNav((s) => s.setSearchOpen);
  const backToOverview = useNav((s) => s.backToOverview);
  const compareMode = useNav((s) => s.compareMode);
  const toggleCompareMode = useNav((s) => s.toggleCompareMode);
  const setOnboarding = useNav((s) => s.setOnboarding);
  const view = useNav((s) => s.view);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  const showCompareBtn = view.kind === "overview";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:px-6">
        <button
          onClick={backToOverview}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-105">
            <Rocket className="h-5 w-5" />
          </span>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-bold text-[15px] tracking-tight">
              RankForge
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              SEO Platform
            </span>
          </div>
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setSearchOpen(true)}
          className="group relative hidden md:flex items-center gap-2 h-9 w-64 rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search companies, keywords…</span>
          <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        {showCompareBtn && (
          <>
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={toggleCompareMode}
              className={cn(
                "gap-1.5 hidden sm:flex",
                compareMode && "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
              )}
            >
              <GitCompare className="h-4 w-4" />
              <span className="hidden lg:inline">Compare</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setOnboarding(true)}
              className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hidden sm:flex"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden lg:inline">Onboard Client</span>
            </Button>
          </>
        )}

        <NotificationsBell />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          suppressHydrationWarning
        >
          <Sun className="h-4 w-4 hidden dark:block" />
          <Moon className="h-4 w-4 block dark:hidden" />
        </Button>
      </div>
    </header>
  );
}
