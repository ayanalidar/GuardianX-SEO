"use client";

import { DomainWithCompanies } from "@/lib/seo/types";
import { motion } from "framer-motion";
import {
  AnimatedCounter, CinematicBackground, Reveal, StaggerContainer, StaggerItem,
} from "../motion";
import { useNav, MarketingPage } from "@/store/nav";
import {
  Rocket, ArrowRight, Activity, KeyRound, Link2, TrendingUp,
  Sparkles, Zap, Shield, Bot, Gauge, Target, Layers, Trophy,
  Check, Star, BarChart3, Globe,
} from "lucide-react";

const CAPABILITIES = [
  { icon: TrendingUp, title: "Rank Tracking", desc: "Live keyword positions with 14-day trend sparklines, change deltas & intent classification." },
  { icon: Shield, title: "Technical Audit", desc: "600+ issue detection across Core Web Vitals, crawlability, mobile, schema & security." },
  { icon: Link2, title: "Backlink Intelligence", desc: "Dofollow/nofollow distribution, new/lost link tracking, top referring domains by DA." },
  { icon: Bot, title: "AI-Powered Insights", desc: "LLM-generated, data-driven recommendations referencing your real metrics & competitors." },
  { icon: Gauge, title: "Core Web Vitals", desc: "Per-URL LCP, FID, CLS, INP, TTFB & FCP with mobile vs desktop semicircle gauges." },
  { icon: Layers, title: "SERP Features", desc: "Track featured snippets, sitelinks, FAQs, video & more — captured vs lost to competitors." },
  { icon: Target, title: "Content Gaps", desc: "Discover keywords competitors rank for that you don't, ranked by opportunity score." },
  { icon: Trophy, title: "Competitor Analysis", desc: "Side-by-side traffic overlap, common keywords & authority comparison with winner badges." },
];

const STATS = [
  { icon: Globe, label: "Business Domains", value: 10 },
  { icon: Activity, label: "Companies Tracked", value: 50 },
  { icon: KeyRound, label: "Keywords Monitored", value: 1000 },
  { icon: Link2, label: "Backlinks Analyzed", value: 900 },
];

export function MarketingHome({
  domains,
  loading,
  onEnter,
  onOnboard,
  setMarketingPage,
}: {
  domains: DomainWithCompanies[];
  loading: boolean;
  onEnter: () => void;
  onOnboard: () => void;
  setMarketingPage: (p: MarketingPage) => void;
}) {
  const totalCompanies = domains.reduce((s, d) => s + d.companies.length, 0);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden rf-grain">
        <CinematicBackground variant="mesh" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]"
          >
            Put your brand
            <br />
            <span className="rf-gradient-text">on top of search</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            RankForge is the most advanced SEO platform of this era. Track rankings, audit
            technical SEO, analyze backlinks, discover content gaps, and get AI-powered
            recommendations — across multiple business domains, each with a dedicated client portal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={onEnter}
              className="group rf-shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              <Rocket className="h-4 w-4 rf-float" />
              Launch Dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onOnboard}
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Onboard a Client
            </button>
          </motion.div>

          {/* Animated stats */}
          <StaggerContainer className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4" stagger={0.1}>
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <StaggerItem key={s.label}>
                  <div className="rounded-xl border bg-background/60 p-5">
                    <Icon className="h-5 w-5 text-primary mx-auto" />
                    <div className="mt-2 text-3xl font-bold tabular-nums">
                      <AnimatedCounter value={s.value} format={false} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* CAPABILITIES PREVIEW */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-20">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Capabilities
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to dominate SERPs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Nine powerful modules working together in one cinematic command center.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <StaggerItem key={c.title}>
                <div className="group rounded-2xl border bg-card p-5 h-full hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-primary group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-all">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <Reveal delay={0.2}>
          <div className="mt-10 text-center">
            <button
              onClick={() => setMarketingPage("capabilities")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              View all capabilities
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </section>

      {/* INDUSTRIES PREVIEW */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-20 border-t">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Globe className="h-3.5 w-3.5" />
              Industries
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Built for every business domain
            </h2>
            <p className="mt-3 text-muted-foreground">
              {domains.length || 10} industries, {totalCompanies || 50} companies tracked — each with its own dedicated dashboard.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" stagger={0.04}>
          {(loading ? [] : domains).slice(0, 10).map((d) => (
            <StaggerItem key={d.id}>
              <button
                onClick={() => setMarketingPage("industries")}
                className="w-full rounded-xl border bg-card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold"
                    style={{ backgroundColor: d.accent }}
                  >
                    {d.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium truncate">{d.name}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{d.companies.length} companies</div>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-8 md:p-12 text-center">
            <CinematicBackground variant="orbs" />
            <div className="relative z-10">
              <BarChart3 className="h-10 w-10 text-primary mx-auto" />
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                Ready to climb the rankings?
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Launch the dashboard, onboard your clients, and give each one a unique portal
                to manage their SEO — all in under a minute.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onEnter}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <Rocket className="h-4 w-4" />
                  Launch Dashboard
                </button>
                <button
                  onClick={() => setMarketingPage("auth")}
                  className="inline-flex items-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <Star className="h-4 w-4 text-primary" />
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
