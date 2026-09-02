"use client";

import { motion } from "framer-motion";
import { Reveal, CinematicBackground, StaggerContainer, StaggerItem } from "../motion";
import {
  Check, X, DollarSign, Zap, Shield, Bot, TrendingUp, Target,
  Globe, Activity, Rocket, ArrowRight, Trophy, Star,
} from "lucide-react";

const COMPETITORS = [
  { name: "GuardianX-SEO", price: 2999, features: 25, highlight: true, note: "All-in-one platform" },
  { name: "BrightEdge", price: 35000, features: 18, note: "Enterprise only" },
  { name: "Conductor", price: 40000, features: 16, note: "Enterprise only" },
  { name: "Searchmetrics", price: 28000, features: 15, note: "Enterprise only" },
  { name: "Botify", price: 25000, features: 14, note: "Crawler-focused" },
];

const INCLUDED_FEATURES = [
  "Rank tracking across 50+ companies",
  "Technical SEO audit (600+ issues)",
  "Core Web Vitals monitoring",
  "SERP feature tracking",
  "Backlink intelligence",
  "Competitor analysis & alerts",
  "AI-powered SEO insights",
  "AI content brief generator",
  "Live site crawler (real data)",
  "Multi-page site auditor",
  "Auto-fix code snippet generator",
  "Content optimizer (AI)",
  "ROI & revenue calculator",
  "4-week action roadmap",
  "Client portal with unique links",
  "Website tracking script",
  "Live visitor analytics",
  "Competitive landscape radar",
  "SEO forecasting (AI)",
  "Keyword opportunities heatmap",
  "Internal link graph visualization",
  "Geo rank tracking (10 countries)",
  "Branded PDF reports",
  "CSV exports (all data)",
  "Weekly email digests",
];

export function MarketingPricing({ onLogin }: { onLogin: () => void }) {
  const avgCompetitorPrice = Math.round(
    COMPETITORS.filter((c) => !c.highlight).reduce((s, c) => s + c.price, 0) /
      (COMPETITORS.length - 1)
  );
  const savings = avgCompetitorPrice - 2999;
  const savingsPct = Math.round((savings / avgCompetitorPrice) * 100);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <CinematicBackground variant="mesh" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            Simple, transparent pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-4xl md:text-5xl font-bold tracking-tight"
          >
            One plan.{" "}
            <span className="rf-gradient-text">Everything included.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 mx-auto max-w-2xl text-muted-foreground leading-relaxed"
          >
            The most powerful SEO platform at the{" "}
            <span className="font-semibold text-foreground">lowest price in the market</span>.
            No tiers, no add-ons, no hidden fees.
          </motion.p>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 inline-flex flex-col items-center"
          >
            <div className="flex items-end gap-2">
              <span className="text-5xl md:text-6xl font-bold tabular-nums">₹2,999</span>
              <span className="text-lg text-muted-foreground mb-2">/month</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <Trophy className="h-4 w-4" />
              Save {savingsPct}% vs competitors (₹{avgCompetitorPrice.toLocaleString('en-IN')}/mo avg)
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={onLogin}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all rf-shine"
            >
              <Rocket className="h-4 w-4 rf-float" />
              Get Started Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Price comparison */}
      <section className="mx-auto max-w-[1000px] px-4 md:px-6 py-16">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              How we compare
            </h2>
            <p className="mt-2 text-muted-foreground">
              GuardianX-SEO includes more features than any competitor — at a lower price.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-x-auto rf-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-semibold text-muted-foreground">Platform</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Monthly Price</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Features</th>
                  <th className="text-left py-3 pl-4 font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <motion.tr
                    key={c.name}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`border-b last:border-b-0 ${c.highlight ? "bg-emerald-500/5" : ""}`}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {c.highlight && <Trophy className="h-4 w-4 text-amber-500" />}
                        <span className={`font-medium ${c.highlight ? "text-primary" : ""}`}>{c.name}</span>
                        {c.highlight && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">BEST VALUE</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`text-lg font-bold tabular-nums ${c.highlight ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                        ₹{c.price.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-flex items-center gap-1">
                        {c.highlight ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : null}
                        <span className="font-semibold tabular-nums">{c.features}+</span>
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-xs text-muted-foreground">{c.note}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Savings callout */}
        <Reveal delay={0.2}>
          <div className="mt-8 rounded-2xl border bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              ₹{savings.toLocaleString('en-IN')}/mo
            </div>
            <div className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              You save vs the average enterprise SEO platform
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              That&apos;s <strong>₹{(savings * 12).toLocaleString('en-IN')}/year</strong> in savings —
              with more features, AI-powered insights, and a client portal included.
            </div>
          </div>
        </Reveal>
      </section>

      {/* What's included */}
      <section className="mx-auto max-w-[1000px] px-4 md:px-6 py-16 border-t">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Check className="h-3.5 w-3.5" />
              Everything included
            </div>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">
              25+ features, zero add-ons
            </h2>
            <p className="mt-2 text-muted-foreground">
              Every feature is included from day one. No upsells, no tiers, no limits.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" stagger={0.03}>
          {INCLUDED_FEATURES.map((feature, i) => (
            <StaggerItem key={i}>
              <div className="flex items-center gap-2 rounded-lg border bg-card p-2.5 hover:shadow-sm transition-shadow">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs">{feature}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* FAQ-style value props */}
      <section className="mx-auto max-w-[1000px] px-4 md:px-6 py-16 border-t">
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Why ₹2,999/mo is a steal</h2>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Bot, title: "AI-powered everything", desc: "Other platforms charge extra for AI. We include AI insights, content briefs, issue fixes, forecasting, and content optimization — all powered by LLMs." },
            { icon: Globe, title: "Real website crawling", desc: "We actually fetch and analyze your live website — not just keyword data. Multi-page crawler, auto-fix generator, and content optimizer included." },
            { icon: Rocket, title: "Client portals included", desc: "Each of your clients gets a unique portal link with their own dashboard, ROI calculator, and action roadmap. No extra charge per client." },
            { icon: TrendingUp, title: "ROI attribution", desc: "We translate organic traffic into revenue. Prove your SEO ROI with traffic × conversion × AOV calculations built in." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={i} delay={i * 0.08}>
                <div className="rounded-2xl border bg-card p-5 rf-lift">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1000px] px-4 md:px-6 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-8 md:p-12 text-center">
            <CinematicBackground variant="orbs" />
            <div className="relative z-10">
              <Star className="h-10 w-10 text-primary mx-auto" />
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Start dominating search today
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Login now and get instant access to all 25+ features — no setup fee, no contract, cancel anytime.
              </p>
              <button
                onClick={onLogin}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all rf-shine"
              >
                <Rocket className="h-4 w-4" />
                Login to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
