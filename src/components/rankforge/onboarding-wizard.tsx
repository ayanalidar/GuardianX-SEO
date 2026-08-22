"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNav } from "@/store/nav";
import { useFetch } from "@/lib/seo/hooks";
import { DomainIcon } from "./icons";
import {
  Rocket, ArrowRight, ArrowLeft, Check, Building2, Target,
  TrendingUp, Globe, Users, Calendar, Loader2, Copy, ExternalLink,
  Sparkles, Trophy, Zap, Search, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type DomainInfo = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  accent: string;
  description: string;
};

const PRIMARY_GOALS = [
  { value: "Increase organic traffic", icon: TrendingUp, desc: "Drive more visitors from search" },
  { value: "Rank #1 for target keywords", icon: Trophy, desc: "Dominate top SERP positions" },
  { value: "Grow backlinks & authority", icon: Link2, desc: "Build a stronger link profile" },
  { value: "Improve technical SEO health", icon: Zap, desc: "Fix crawl & performance issues" },
];

const ROLES = ["Owner", "Marketing Manager", "SEO Specialist", "Agency"];

export function OnboardingWizard() {
  const open = useNav((s) => s.onboarding);
  const setOpen = useNav((s) => s.setOnboarding);
  const openCompany = useNav((s) => s.openCompany);
  const { toast } = useToast();
  const { data } = useFetch<{ domains: DomainInfo[] }>("/api/domains");
  const domains = data?.domains ?? [];

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ portalUrl: string; companyId: string; companySlug: string; domainSlug: string } | null>(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    website: "",
    description: "",
    location: "",
    employees: "1-10",
    foundedYear: new Date().getFullYear(),
    industry: "",
    domainSlug: "",
    clientName: "",
    email: "",
    phone: "",
    role: "Owner",
    primaryGoal: "",
    targetKeywords: 100,
    targetTraffic: 100000,
    targetDA: 50,
  });

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setStep(0);
    setResult(null);
    setForm({
      name: "", website: "", description: "", location: "", employees: "1-10",
      foundedYear: new Date().getFullYear(), industry: "", domainSlug: "",
      clientName: "", email: "", phone: "", role: "Owner", primaryGoal: "",
      targetKeywords: 100, targetTraffic: 100000, targetDA: 50,
    });
  };

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(reset, 300);
    }
  };

  const canProceed = () => {
    if (step === 0) return form.name && form.website && form.domainSlug;
    if (step === 1) return form.clientName && form.email;
    if (step === 2) return form.primaryGoal;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Onboarding failed");
      }
      const j = await r.json();
      setResult({
        portalUrl: j.portalUrl,
        companyId: j.companyId,
        companySlug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        domainSlug: form.domainSlug,
      });
      toast({
        title: "Client onboarded!",
        description: "Unique portal link generated successfully.",
      });
    } catch (e) {
      toast({
        title: "Onboarding failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    if (!result) return;
    const url = `${window.location.origin}${result.portalUrl}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share it with your client." });
  };

  const steps = [
    { label: "Business", icon: Building2 },
    { label: "Contact", icon: Users },
    { label: "Goals", icon: Target },
    { label: "Done", icon: Rocket },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto rf-scroll">
        {/* Header with progress */}
        <div className="relative overflow-hidden border-b bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
              <Rocket className="h-4 w-4" />
              Client Onboarding
            </div>
            <h2 className="text-xl font-bold">Launch a new client portal</h2>
            {/* Step indicators */}
            <div className="mt-4 flex items-center gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const done = i < step;
                const active = i === step;
                return (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor: done || active ? "oklch(0.62 0.14 158)" : "var(--muted)",
                          color: done || active ? "white" : "var(--muted-foreground)",
                          scale: active ? 1.1 : 1,
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                      >
                        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </motion.div>
                      <span className={cn("text-xs font-medium hidden sm:inline", active ? "text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex-1 h-0.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={false}
                          animate={{ width: done ? "100%" : "0%" }}
                          transition={{ duration: 0.4 }}
                          className="h-full bg-primary"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[320px]">
          <AnimatePresence mode="wait">
            {result ? (
              /* Success screen */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 mb-4"
                >
                  <Check className="h-10 w-10" strokeWidth={3} />
                </motion.div>
                <h3 className="text-2xl font-bold">Client Onboarded!</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  We&apos;ve created a dedicated portal for <strong>{form.name}</strong> with a 30-day
                  metric baseline, default goals, and an SEO action plan.
                </p>

                {/* Portal link */}
                <div className="mt-6 mx-auto max-w-md">
                  <Label className="text-xs font-medium text-muted-foreground">Unique Client Portal Link</Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border bg-muted/40 p-2">
                    <Link2 className="h-4 w-4 text-primary shrink-0 ml-1" />
                    <code className="flex-1 text-xs truncate text-foreground">
                      {window.location.origin}{result.portalUrl}
                    </code>
                    <Button size="sm" variant="ghost" onClick={copyLink} className="gap-1">
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(result.portalUrl, "_blank");
                    }}
                    className="gap-1.5"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Portal
                  </Button>
                  <Button
                    onClick={() => {
                      openCompany(result.companyId, result.companySlug, result.domainSlug);
                      handleClose(false);
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    View Dashboard
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Business information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Business name" required>
                        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme SEO Co." />
                      </Field>
                      <Field label="Website" required>
                        <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="acme-seo.com" />
                      </Field>
                      <Field label="Industry">
                        <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Digital Marketing" />
                      </Field>
                      <Field label="Location">
                        <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="San Francisco, US" />
                      </Field>
                      <Field label="Employees">
                        <Input value={form.employees} onChange={(e) => set("employees", e.target.value)} placeholder="1-10" />
                      </Field>
                      <Field label="Founded year">
                        <Input type="number" value={form.foundedYear} onChange={(e) => set("foundedYear", Number(e.target.value))} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description of the business…" rows={2} />
                    </Field>
                    <Field label="Business domain category" required>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                        {domains.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => set("domainSlug", d.slug)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-all hover:shadow-sm",
                              form.domainSlug === d.slug
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                : "hover:bg-muted/40"
                            )}
                          >
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-md text-white shrink-0"
                              style={{ backgroundColor: d.accent }}
                            >
                              <DomainIcon name={d.icon} className="h-4 w-4" />
                            </span>
                            <span className="font-medium truncate">{d.name}</span>
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Client contact</h3>
                    <p className="text-sm text-muted-foreground">Who will manage this business&apos;s SEO portal?</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full name" required>
                        <Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Jane Doe" />
                      </Field>
                      <Field label="Email" required>
                        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@acme-seo.com" />
                      </Field>
                      <Field label="Phone">
                        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 0100" />
                      </Field>
                      <Field label="Role">
                        <div className="flex flex-wrap gap-1.5">
                          {ROLES.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => set("role", r)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                form.role === r ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">SEO goals & targets</h3>
                    <Field label="Primary goal" required>
                      <div className="grid sm:grid-cols-2 gap-2 mt-1">
                        {PRIMARY_GOALS.map((g) => {
                          const Icon = g.icon;
                          return (
                            <button
                              key={g.value}
                              type="button"
                              onClick={() => set("primaryGoal", g.value)}
                              className={cn(
                                "flex items-start gap-3 rounded-xl border p-3 text-left transition-all hover:shadow-sm",
                                form.primaryGoal === g.value
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                  : "hover:bg-muted/40"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                                  form.primaryGoal === g.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <div>
                                <div className="text-sm font-medium">{g.value}</div>
                                <div className="text-xs text-muted-foreground">{g.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-3 pt-2">
                      <Field label="Target traffic (visits/mo)">
                        <Input type="number" value={form.targetTraffic} onChange={(e) => set("targetTraffic", Number(e.target.value))} />
                      </Field>
                      <Field label="Target keywords ranked">
                        <Input type="number" value={form.targetKeywords} onChange={(e) => set("targetKeywords", Number(e.target.value))} />
                      </Field>
                      <Field label="Target domain authority">
                        <Input type="number" value={form.targetDA} onChange={(e) => set("targetDA", Number(e.target.value))} />
                      </Field>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => step > 0 ? setStep(step - 1) : handleClose(false)}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <div className="text-xs text-muted-foreground">Step {step + 1} of 3</div>
            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={submitting || !canProceed()}
                className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Onboard Client
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
