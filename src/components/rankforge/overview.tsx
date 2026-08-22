"use client";

import { DomainWithCompanies } from "@/lib/seo/types";
import { CompanyCard } from "./company-card";
import { DomainIcon } from "./icons";
import { formatNumber } from "@/lib/seo/hooks";
import {
  Building2, TrendingUp, KeyRound, Link2, Sparkles, Activity,
  Rocket, ArrowRight, Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { AnimatedCounter, CinematicBackground, Reveal, StaggerContainer, StaggerItem } from "./motion";
import { useNav } from "@/store/nav";

export function Overview({
  domains,
  activeSlug,
  loading,
}: {
  domains: DomainWithCompanies[];
  activeSlug?: string;
  loading?: boolean;
}) {
  const filtered =
    !activeSlug || activeSlug === "all"
      ? domains
      : domains.filter((d) => d.slug === activeSlug);

  const setOnboarding = useNav((s) => s.setOnboarding);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Aggregate platform-wide stats
  const allCompanies = domains.flatMap((d) => d.companies);
  const totalTraffic = allCompanies.reduce(
    (s, c) => s + (c.latest?.organicTraffic ?? 0),
    0
  );
  const totalKeywords = allCompanies.reduce(
    (s, c) => s + (c.latest?.keywordsRanked ?? 0),
    0
  );
  const totalBacklinks = allCompanies.reduce((s, c) => s + c.blCount, 0);
  const avgDA =
    allCompanies.length > 0
      ? allCompanies.reduce((s, c) => s + (c.latest?.domainAuthority ?? 0), 0) /
        allCompanies.length
      : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 space-y-8">
      {/* Cinematic Hero */}
      {!activeSlug || activeSlug === "all" ? (
        <section className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-10">
          <CinematicBackground variant="mesh" />
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 rf-pulse-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Advanced SEO Intelligence · Real-time tracking
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
            >
              The SEO platform that
              <br />
              puts your{" "}
              <span className="rf-gradient-text">brands on top</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-4 max-w-2xl text-muted-foreground leading-relaxed text-base md:text-lg"
            >
              Track rankings, audit technical SEO, analyze backlinks, discover content gaps
              and get AI-generated recommendations — all from one cinematic command center
              spanning {domains.length} business domains and {allCompanies.length} companies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => setOnboarding(true)}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
              >
                <Rocket className="h-4 w-4" />
                Onboard a Client
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-amber-500" />
                Get a unique client portal link in 60 seconds
              </div>
            </motion.div>

            {/* Animated platform stats */}
            <StaggerContainer className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4" stagger={0.12}>
              <StaggerItem>
                <PlatformStat
                  icon={Activity}
                  label="Organic Traffic Tracked"
                  value={<AnimatedCounter value={totalTraffic} />}
                  hint="across all companies"
                />
              </StaggerItem>
              <StaggerItem>
                <PlatformStat
                  icon={KeyRound}
                  label="Keywords Ranked"
                  value={<AnimatedCounter value={totalKeywords} />}
                  hint="live position tracking"
                />
              </StaggerItem>
              <StaggerItem>
                <PlatformStat
                  icon={Link2}
                  label="Backlinks Analyzed"
                  value={<AnimatedCounter value={totalBacklinks} />}
                  hint="profile intelligence"
                />
              </StaggerItem>
              <StaggerItem>
                <PlatformStat
                  icon={TrendingUp}
                  label="Avg Domain Authority"
                  value={<AnimatedCounter value={avgDA} decimals={1} format={false} />}
                  hint="across portfolio"
                />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>
      ) : (
        filtered.length > 0 && <DomainHeader domain={filtered[0]} />
      )}

      {/* Domain sections */}
      {filtered.map((d, dIdx) => {
        const domainTraffic = d.companies.reduce(
          (s, c) => s + (c.latest?.organicTraffic ?? 0),
          0
        );
        const domainDA =
          d.companies.length > 0
            ? d.companies.reduce((s, c) => s + (c.latest?.domainAuthority ?? 0), 0) /
              d.companies.length
            : 0;
        return (
          <section key={d.id} className="space-y-4">
            <Reveal delay={dIdx * 0.05}>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
                    style={{ backgroundColor: d.accent }}
                  >
                    <DomainIcon name={d.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      {d.name}
                      <span className="text-sm font-normal text-muted-foreground">
                        · {d.companies.length} companies
                      </span>
                    </h2>
                    <p className="text-sm text-muted-foreground">{d.description}</p>
                  </div>
                </div>
                {(!activeSlug || activeSlug === "all") ? (
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Total Traffic</div>
                      <div className="font-bold tabular-nums">{formatNumber(domainTraffic)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Avg DA</div>
                      <div className="font-bold tabular-nums">{domainDA.toFixed(1)}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </Reveal>
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" stagger={0.06}>
              {d.companies.map((c) => (
                <StaggerItem key={c.id}>
                  <CompanyCard company={c} domain={d} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        );
      })}
    </div>
  );
}

function PlatformStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Activity;
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-4 rf-lift">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
    </div>
  );
}

function DomainHeader({ domain }: { domain: DomainWithCompanies }) {
  const traffic = domain.companies.reduce(
    (s, c) => s + (c.latest?.organicTraffic ?? 0),
    0
  );
  const keywords = domain.companies.reduce(
    (s, c) => s + (c.latest?.keywordsRanked ?? 0),
    0
  );
  const da =
    domain.companies.length > 0
      ? domain.companies.reduce((s, c) => s + (c.latest?.domainAuthority ?? 0), 0) /
        domain.companies.length
      : 0;
  return (
    <Reveal>
      <section
        className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
        style={{
          background: `linear-gradient(135deg, ${domain.accent}14, transparent 60%)`,
        }}
      >
        <div className="flex items-start gap-4 flex-wrap">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: domain.accent }}
          >
            <DomainIcon name={domain.icon} className="h-7 w-7" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {domain.name}
            </h1>
            <p className="mt-1 text-muted-foreground max-w-2xl">{domain.description}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <DomainStat icon={Building2} label="Companies" value={String(domain.companies.length)} />
          <DomainStat icon={Activity} label="Organic Traffic" value={formatNumber(traffic)} />
          <DomainStat icon={KeyRound} label="Keywords Ranked" value={formatNumber(keywords)} />
          <DomainStat icon={TrendingUp} label="Avg Domain Authority" value={da.toFixed(1)} />
        </div>
      </section>
    </Reveal>
  );

  function DomainStat({
    icon: Icon,
    label,
    value,
  }: {
    icon: typeof Activity;
    label: string;
    value: string;
  }) {
    return (
      <div className="rounded-xl border bg-background/70 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className="mt-1.5 text-xl font-bold tabular-nums">{value}</div>
      </div>
    );
  }
}
