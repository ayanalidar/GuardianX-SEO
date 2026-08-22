"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CinematicBackground } from "../motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Rocket, Mail, Lock, User, ArrowRight, ArrowLeft, Sparkles,
  Check, TrendingUp, Shield, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketingAuth({
  onSuccess,
  onOnboard,
}: {
  onSuccess: () => void;
  onOnboard: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: mode === "login" ? "Welcome back!" : "Account created!",
        description: mode === "login"
          ? "Entering your SEO command center."
          : "Your RankForge account is ready. Launch the dashboard.",
      });
      onSuccess();
    }, 900);
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
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {mode === "login" ? "Welcome back" : "Join RankForge"}
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
              Access the most advanced SEO platform. Track rankings, audit technical SEO,
              analyze backlinks, and get AI-powered recommendations — all in one place.
            </motion.p>

            <div className="mt-8 space-y-3">
              {[
                { icon: TrendingUp, text: "Real-time rank tracking across 50 companies" },
                { icon: Shield, text: "600+ technical SEO issue detection" },
                { icon: Bot, text: "AI-powered, data-driven recommendations" },
                { icon: Rocket, text: "Unique client portal for every business" },
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
                    onClick={() => setMode(m)}
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
                  <div className="font-bold">RankForge SEO</div>
                  <div className="text-xs text-muted-foreground">
                    {mode === "login" ? "Sign in to your account" : "Create your free account"}
                  </div>
                </div>
              </div>

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
                        <Input required className="pl-9" placeholder="Jane Doe" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" required className="pl-9" placeholder="you@company.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" required className="pl-9" placeholder="••••••••" />
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
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5 h-11"
                  >
                    {submitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {mode === "login" ? "Signing in…" : "Creating account…"}
                      </>
                    ) : (
                      <>
                        {mode === "login" ? "Sign in" : "Create account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {mode === "signup" && (
                    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        After signup, launch the dashboard and onboard your first client to
                        generate a unique portal link in 60 seconds.
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

              <button
                onClick={onOnboard}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Onboard a client instead
              </button>

              <div className="mt-4 text-center text-xs text-muted-foreground">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
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
