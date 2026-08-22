"use client";

import { useNav, MarketingPage } from "@/store/nav";
import { DomainWithCompanies } from "@/lib/seo/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Home as HomeIcon, Grid3x3, Shield, LogIn, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MarketingHome } from "./marketing-home";
import { MarketingIndustries } from "./marketing-industries";
import { MarketingCapabilities } from "./marketing-capabilities";
import { MarketingAuth } from "./marketing-auth";

const NAV_ITEMS: Array<{ page: MarketingPage; label: string; icon: typeof HomeIcon }> = [
  { page: "home", label: "Home", icon: HomeIcon },
  { page: "industries", label: "Industries", icon: Grid3x3 },
  { page: "capabilities", label: "Capabilities", icon: Shield },
  { page: "auth", label: "Login / Sign up", icon: LogIn },
];

export function MarketingSite({
  domains,
  loading,
}: {
  domains: DomainWithCompanies[];
  loading: boolean;
}) {
  const view = useNav((s) => s.view);
  const setMarketingPage = useNav((s) => s.setMarketingPage);
  const enterApp = useNav((s) => s.enterApp);
  const setOnboarding = useNav((s) => s.setOnboarding);
  const [mobileOpen, setMobileOpen] = useState(false);

  const page = view.kind === "marketing" ? view.page : "home";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Marketing Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 md:px-6">
          <button
            onClick={() => setMarketingPage("home")}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-105">
              <Rocket className="h-5 w-5" />
            </span>
            <span className="font-bold text-[15px] tracking-tight">RankForge SEO</span>
          </button>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = page === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => setMarketingPage(item.page)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          <button
            onClick={() => enterApp()}
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Rocket className="h-4 w-4" />
            Launch Dashboard
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.page}
                      onClick={() => {
                        setMarketingPage(item.page);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                        page === item.page ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    enterApp();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <Rocket className="h-4 w-4" />
                  Launch Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {page === "home" && (
              <MarketingHome domains={domains} loading={loading} onEnter={enterApp} onOnboard={() => setOnboarding(true)} setMarketingPage={setMarketingPage} />
            )}
            {page === "industries" && (
              <MarketingIndustries domains={domains} loading={loading} onEnter={enterApp} />
            )}
            {page === "capabilities" && <MarketingCapabilities onEnter={enterApp} />}
            {page === "auth" && <MarketingAuth onSuccess={enterApp} onOnboard={() => setOnboarding(true)} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Marketing footer */}
      <footer className="mt-auto border-t bg-background">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Rocket className="h-4 w-4" />
                </span>
                <span className="font-bold">RankForge SEO</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground max-w-md">
                The most advanced multi-domain SEO optimization platform. Track rankings,
                audit technical SEO, analyze backlinks, and get AI-powered recommendations
                — all from one cinematic command center.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Product</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button onClick={() => setMarketingPage("capabilities")} className="block hover:text-foreground">Capabilities</button>
                <button onClick={() => setMarketingPage("industries")} className="block hover:text-foreground">Industries</button>
                <button onClick={() => { enterApp(); }} className="block hover:text-foreground">Dashboard</button>
                <button onClick={() => setOnboarding(true)} className="block hover:text-foreground">Onboard a Client</button>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Account</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <button onClick={() => setMarketingPage("auth")} className="block hover:text-foreground">Login</button>
                <button onClick={() => setMarketingPage("auth")} className="block hover:text-foreground">Sign up</button>
                <button onClick={() => setOnboarding(true)} className="block hover:text-foreground">Get a portal link</button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} RankForge SEO · Advanced SEO Intelligence</span>
            <span>10 domains · 50 companies · 5,000+ data points</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
