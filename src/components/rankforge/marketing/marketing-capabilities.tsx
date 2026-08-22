"use client";

import { motion } from "framer-motion";
import { Reveal, StaggerContainer, StaggerItem, CinematicBackground } from "../motion";
import {
  TrendingUp, Shield, Link2, Bot, Gauge, Layers, Target, Trophy,
  Zap, Globe, Rocket, ArrowRight, Check, BarChart3, Search,
  Smartphone, Monitor, FileDown, GitCompare, KeyRound, Activity,
  Lightbulb, AlertTriangle, Crown, Map, Network, Cloud,
} from "lucide-react";

const CAPABILITY_GROUPS = [
  {
    title: "Rank & Visibility Tracking",
    icon: TrendingUp,
    color: "#10b981",
    items: [
      { icon: TrendingUp, title: "Keyword Rank Tracking", desc: "Live positions with 14-day sparkline trends, change deltas, search volume & CPC." },
      { icon: KeyRound, title: "Position Distribution", desc: "Bucketed analysis (1-3, 4-10, 11-20, 21-50, 51-100) for quick SERP share insights." },
      { icon: Layers, title: "SERP Feature Tracking", desc: "Featured snippets, sitelinks, FAQs, video, image packs — captured vs lost to competitors." },
      { icon: Trophy, title: "Visibility Score", desc: "Composite visibility % tracked daily, with avg position correlation charts." },
    ],
  },
  {
    title: "Technical SEO & Performance",
    icon: Shield,
    color: "#0ea5e9",
    items: [
      { icon: Shield, title: "Technical SEO Audit", desc: "600+ issues across crawlability, mobile, schema, security & indexability with severity cards." },
      { icon: Gauge, title: "Core Web Vitals Deep-Dive", desc: "Per-URL LCP, FID, CLS, INP, TTFB & FCP with mobile vs desktop semicircle gauges." },
      { icon: Smartphone, title: "Mobile Optimization", desc: "Mobile-specific rendering, tap-target & viewport analysis." },
      { icon: Zap, title: "Page Experience", desc: "Load time, bounce rate & CTR composite experience scoring." },
    ],
  },
  {
    title: "Backlink & Authority Intelligence",
    icon: Link2,
    color: "#8b5cf6",
    items: [
      { icon: Link2, title: "Backlink Profile Analysis", desc: "Dofollow/nofollow distribution, new/active/lost status tracking & top referring domains." },
      { icon: BarChart3, title: "Domain & Page Authority", desc: "30-day authority trend charts with page authority correlation." },
      { icon: Network, title: "Referring Domains", desc: "Traffic attribution per linking domain with anchor-text intelligence." },
      { icon: Activity, title: "Link Velocity", desc: "New vs lost link ratio monitoring over time." },
    ],
  },
  {
    title: "Competitive Intelligence",
    icon: Target,
    color: "#f59e0b",
    items: [
      { icon: Trophy, title: "Competitor Analysis", desc: "Traffic overlap, common keywords, DA & backlink comparison with winner crowns." },
      { icon: GitCompare, title: "Company Comparison View", desc: "Select 2-4 companies for side-by-side head-to-head metrics & score breakdown." },
      { icon: Target, title: "Content Gap Discovery", desc: "Keywords competitors rank for that you don't, ranked by opportunity score." },
      { icon: AlertTriangle, title: "Competitor Alerts", desc: "Real-time notifications when rivals gain/lose top rankings or launch content." },
    ],
  },
  {
    title: "AI-Powered Intelligence",
    icon: Bot,
    color: "#ec4899",
    items: [
      { icon: Bot, title: "AI-Powered SEO Insights", desc: "LLM-generated, data-driven recommendations referencing your real metrics & competitors." },
      { icon: Lightbulb, title: "AI Content Brief Generator", desc: "Given a target keyword, generate full content briefs with outline, entities & title/meta." },
      { icon: Zap, title: "Opportunity Scoring", desc: "Weighted opportunity scores for content gaps based on volume, difficulty & intent." },
      { icon: Crown, title: "Smart Leader Detection", desc: "Automatic identification of top performers across any metric for benchmarking." },
    ],
  },
  {
    title: "Client & Workflow",
    icon: Rocket,
    color: "#14b8a6",
    items: [
      { icon: Rocket, title: "Client Onboarding Wizard", desc: "3-step cinematic wizard creates company + client + 30-day baseline + goals + tasks." },
      { icon: Globe, title: "Unique Client Portals", desc: "Each client gets a shareable /portal/[token] link to manage their own SEO dashboard." },
      { icon: Target, title: "Goal Tracking", desc: "Live progress bars toward traffic, keyword, authority & position targets." },
      { icon: FileDown, title: "CSV & PDF Export", desc: "Export keyword & backlink reports, plus branded client PDF reports." },
    ],
  },
];

export function MarketingCapabilities({ onEnter }: { onEnter: () => void }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <CinematicBackground variant="orbs" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Platform capabilities
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-4xl md:text-5xl font-bold tracking-tight"
          >
            One platform,{" "}
            <span className="rf-gradient-text">every SEO capability</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 mx-auto max-w-2xl text-muted-foreground leading-relaxed"
          >
            Six capability groups, 24+ modules, and AI-powered intelligence — all working
            together in one cinematic command center.
          </motion.p>
        </div>
      </section>

      {/* Capability groups */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-16 space-y-16">
        {CAPABILITY_GROUPS.map((group, gIdx) => {
          const GroupIcon = group.icon;
          return (
            <Reveal key={group.title}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
                    style={{ backgroundColor: group.color }}
                  >
                    <GroupIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Group {gIdx + 1}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{group.title}</h2>
                  </div>
                </div>
                <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <StaggerItem key={item.title}>
                        <div className="group rounded-2xl border bg-card p-5 h-full hover:shadow-lg hover:-translate-y-1 transition-all">
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                            style={{ backgroundColor: `${group.color}1a`, color: group.color }}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <h3 className="mt-3 font-semibold text-sm">{item.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            </Reveal>
          );
        })}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-500/10 to-transparent p-8 md:p-12 text-center">
            <CinematicBackground variant="orbs" />
            <div className="relative z-10">
              <Rocket className="h-10 w-10 text-primary mx-auto" />
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Experience all capabilities live
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Launch the dashboard and explore every module with real data across 50 companies.
              </p>
              <button
                onClick={onEnter}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                <Rocket className="h-4 w-4" />
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
