"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CinematicBackground } from "../motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/store/nav";
import {
  Rocket, Mail, Lock, ArrowRight, ArrowLeft, Check,
  TrendingUp, Shield, Bot, User, Crown, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketingAuth({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const j = await r.json();

      if (!r.ok) {
        setError(j.error || "Login failed");
        setLoading(false);
        return;
      }

      // Route based on role
      if (j.role === "admin") {
        useNav.getState().loginAsAdmin();
        toast({ title: "Welcome, Admin!", description: "Full dashboard access." });
      } else if (j.role === "client") {
        useNav.getState().loginAsClient(j.companyId, j.token, j.name);
        toast({ title: `Welcome, ${j.name}!`, description: "Your SEO dashboard is ready." });
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
      <CinematicBackground variant="mesh" />
      <div className="relative z-10 mx-auto max-w-[1100px] px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: value props */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <Check className="h-3.5 w-3.5 text-primary" />
              {mode === "login" ? "Welcome back" : "Join GuardianX-SEO"}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-4xl font-bold tracking-tight leading-tight"
            >
              {mode === "login"
                ? "Your SEO command center awaits"
                : "Start dominating search today"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-muted-foreground leading-relaxed"
            >
              Login to access your personalized SEO dashboard with real-time rankings,
              AI-powered insights, and your dedicated action roadmap.
            </motion.p>

            <div className="mt-8 space-y-3">
              {[
                { icon: TrendingUp, text: "Real-time rank tracking & live visitor analytics" },
                { icon: Shield, text: "600+ technical SEO issue detection with AI fixes" },
                { icon: Bot, text: "AI-powered recommendations & content optimization" },
                { icon: Rocket, text: "Unique client portal with ROI tracking" },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm">{f.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Role explainer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 rounded-xl border bg-background/40 p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Two access levels
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <Crown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Admin</span>
                    <span className="text-muted-foreground"> — full dashboard, all companies, client onboarding</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Client</span>
                    <span className="text-muted-foreground"> — your company dashboard only, no access to other accounts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: auth form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-3xl border bg-card p-8 shadow-xl">
              {/* Mode toggle */}
              <div className="flex rounded-xl bg-muted p-1 mb-6">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(null); }}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
                      mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m === "login" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <Rocket className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-bold">GuardianX-SEO</div>
                  <div className="text-xs text-muted-foreground">
                    {mode === "login" ? "Sign in to your account" : "Create your free account"}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-600 dark:text-rose-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  onSubmit={submit}
                  className="space-y-4"
                >
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Full name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input required className="pl-9" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" required className="pl-9" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" required className="pl-9" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>

                  {mode === "login" && (
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                        <input type="checkbox" className="rounded" /> Remember me
                      </label>
                      <button type="button" className="text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5 h-11"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        {mode === "login" ? "Login to Dashboard" : "Create account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {mode === "signup" && (
                    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        After signup, you&apos;ll land directly in your SEO dashboard.
                      </span>
                    </div>
                  )}
                </motion.form>
              </AnimatePresence>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                or
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="text-center text-xs text-muted-foreground">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                  className="text-primary font-medium hover:underline"
                >
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </div>
            </div>

            <button
              onClick={() => window.history.back()}
              className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
