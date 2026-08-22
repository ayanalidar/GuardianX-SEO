"use client";

import { DomainWithCompanies } from "@/lib/seo/types";
import { motion } from "framer-motion";
import {
  Reveal, StaggerContainer, StaggerItem, CinematicBackground,
} from "../motion";
import { DomainIcon } from "../icons";
import { useNav } from "@/store/nav";
import { formatNumber } from "@/lib/seo/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe, ArrowRight, Building2, Activity, KeyRound, TrendingUp, Users,
} from "lucide-react";

export function MarketingIndustries({
  domains,
  loading,
  onEnter,
}: {
  domains: DomainWithCompanies[];
  loading: boolean;
  onEnter: () => void;
}) {
  const setDomain = useNav((s) => s.setDomain);
  const enterApp = useNav((s) => s.enterApp);

  const openIndustry = (slug: string) => {
    enterApp();
    setTimeout(() => setDomain(slug), 50);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <CinematicBackground variant="grid" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            Industries we serve
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-4xl md:text-5xl font-bold tracking-tight"
          >
            SEO intelligence for{" "}
            <span className="rf-gradient-text">every industry</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 mx-auto max-w-2xl text-muted-foreground leading-relaxed"
          >
            From e-commerce to healthcare, legal to automotive — RankForge tracks{" "}
            {loading ? 50 : domains.reduce((s, d) => s + d.companies.length, 0)} companies across{" "}
            {loading ? 10 : domains.length} business domains. Each industry gets curated
            keyword pools, competitor benchmarks, and tailored insights.
          </motion.p>
        </div>
      </section>

      {/* Industry grid */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-16">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid gap-6 md:grid-cols-2" stagger={0.06}>
            {domains.map((d) => {
              const traffic = d.companies.reduce((s, c) => s + (c.latest?.organicTraffic ?? 0), 0);
              const keywords = d.companies.reduce((s, c) => s + (c.latest?.keywordsRanked ?? 0), 0);
              const avgDA =
                d.companies.length > 0
                  ? d.companies.reduce((s, c) => s + (c.latest?.domainAuthority ?? 0), 0) / d.companies.length
                  : 0;
              const avgScore =
                d.companies.length > 0
                  ? d.companies.reduce((s, c) => s + (c.latest?.visibilityScore ?? 0), 0) / d.companies.length
                  : 0;
              return (
                <StaggerItem key={d.id}>
                  <div
                    className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                    onClick={() => openIndustry(d.slug)}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: d.accent }}
                    />
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                        style={{ backgroundColor: d.accent }}
                      >
                        <DomainIcon name={d.icon} className="h-7 w-7" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold tracking-tight">{d.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-3">
                      <Stat icon={Building2} label="Companies" value={String(d.companies.length)} />
                      <Stat icon={Activity} label="Traffic" value={formatNumber(traffic)} />
                      <Stat icon={KeyRound} label="Keywords" value={formatNumber(keywords)} />
                      <Stat icon={TrendingUp} label="Avg DA" value={avgDA.toFixed(1)} />
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Avg visibility score</span>
                        <span className="font-bold tabular-nums text-foreground">{avgScore.toFixed(0)}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                        Explore
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        <Reveal delay={0.2}>
          <div className="mt-12 text-center">
            <button
              onClick={onEnter}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
            >
              <Users className="h-4 w-4" />
              Open Full Dashboard
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
      <div className="mt-1 text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}
