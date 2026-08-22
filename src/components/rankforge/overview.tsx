"use client";

import { DomainWithCompanies } from "@/lib/seo/types";
import { CompanyCard } from "./company-card";
import { DomainIcon } from "./icons";
import { formatNumber } from "@/lib/seo/hooks";
import {
  Building2, TrendingUp, KeyRound, Link2, Sparkles, Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      {/* Hero / platform stats */}
      {!activeSlug || activeSlug === "all" ? (
        <section className="relative overflow-hidden rounded-2xl border bg-card rf-hero-glow p-6 md:p-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Advanced SEO Intelligence · Real-time tracking
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              The SEO platform that puts your{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                brands on top
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
              Track rankings, audit technical SEO, analyze backlinks, discover content gaps
              and get AI-generated recommendations — all from one command center spanning{" "}
              {domains.length} business domains and {allCompanies.length} companies.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <PlatformStat
                icon={Activity}
                label="Organic Traffic Tracked"
                value={formatNumber(totalTraffic)}
                hint="across all companies"
              />
              <PlatformStat
                icon={KeyRound}
                label="Keywords Ranked"
                value={formatNumber(totalKeywords)}
                hint="live position tracking"
              />
              <PlatformStat
                icon={Link2}
                label="Backlinks Analyzed"
                value={formatNumber(totalBacklinks)}
                hint="profile intelligence"
              />
              <PlatformStat
                icon={TrendingUp}
                label="Avg Domain Authority"
                value={avgDA.toFixed(1)}
                hint="across portfolio"
              />
            </div>
          </div>
        </section>
      ) : (
        filtered.length > 0 && (
          <DomainHeader domain={filtered[0]} />
        )
      )}

      {/* Domain sections */}
      {filtered.map((d) => {
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
              {!activeSlug || activeSlug === "all" ? (
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {d.companies.map((c) => (
                <CompanyCard key={c.id} company={c} domain={d} />
              ))}
            </div>
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
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-4">
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
