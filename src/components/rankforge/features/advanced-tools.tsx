"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFetch } from "@/lib/seo/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Code2, Gauge, Calendar, FlaskConical, Palette, Plug,
  Loader2, Copy, Check, Zap, Search, BarChart3, Globe, MessageCircle, Send,
  TrendingUp, Trophy, AlertCircle, ArrowRight, FileText, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "writer", label: "AI Content Writer", icon: Wand2 },
  { id: "schema", label: "Schema Injector", icon: Code2 },
  { id: "pagespeed", label: "PageSpeed Insights", icon: Gauge },
  { id: "daily", label: "Daily Crawl", icon: Calendar },
  { id: "abtest", label: "A/B Testing", icon: FlaskConical },
  { id: "whitelabel", label: "White-Label", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Plug },
] as const;

export function AdvancedTools({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<string>("writer");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Advanced SEO Tools
        </CardTitle>
        <CardDescription>AI content writing, schema injection, PageSpeed insights, daily crawls & more</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab selector */}
        <div className="flex gap-1 overflow-x-auto rf-scroll pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {activeTab === "writer" && <AIContentWriter token={token} />}
            {activeTab === "schema" && <SchemaInjector token={token} />}
            {activeTab === "pagespeed" && <PageSpeedInsights token={token} />}
            {activeTab === "daily" && <DailyCrawl token={token} />}
            {activeTab === "abtest" && <ABTesting token={token} />}
            {activeTab === "whitelabel" && <WhiteLabel token={token} />}
            {activeTab === "integrations" && <Integrations token={token} />}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// --- AI Content Writer ---
function AIContentWriter({ token }: { token: string }) {
  const [keyword, setKeyword] = useState("");
  const [contentType, setContentType] = useState("blog post");
  const [wordCount, setWordCount] = useState("1500");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const generate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`/api/client/${token}/write-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, contentType, wordCount: Number(wordCount) }),
      });
      const j = await r.json();
      setResult(j.content);
      toast({ title: "Content generated!", description: `${j.content?.wordCount || 0} words written` });
    } catch { toast({ title: "Generation failed", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const copyContent = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(`<h1>${result.title}</h1>\n${result.content}`);
    toast({ title: "Content copied!" });
  };

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Keyword / Topic</Label>
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="best running shoes" className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Content Type</Label>
          <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full h-9 rounded-md border bg-background px-2 text-sm">
            <option>blog post</option><option>product page</option><option>landing page</option><option>guide</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Word Count</Label>
          <Input type="number" value={wordCount} onChange={(e) => setWordCount(e.target.value)} className="h-9" />
        </div>
      </div>
      <Button onClick={generate} disabled={loading || !keyword.trim()} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {loading ? "AI is writing…" : "Generate Full Article"}
      </Button>
      {loading && <div className="py-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /><p className="text-xs text-muted-foreground mt-2">AI is writing a {wordCount}-word optimized article…</p></div>}
      {result && !loading && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MiniStat label="Words" value={result.wordCount} />
            <MiniStat label="Keyword Density" value={result.keywordDensity} />
            <MiniStat label="Readability" value={result.readabilityScore} />
            <MiniStat label="FAQs" value={result.faqs?.length} />
          </div>
          <div className="rounded-lg border bg-muted/30 p-2 text-xs">
            <div><strong>Title:</strong> {result.title}</div>
            <div className="mt-1"><strong>Meta:</strong> {result.metaDescription}</div>
            <div className="mt-1"><strong>Slug:</strong> /{result.slug}</div>
          </div>
          <div className="rounded-lg border bg-card p-3 max-h-96 overflow-y-auto rf-scroll">
            <div dangerouslySetInnerHTML={{ __html: `<h1>${result.title}</h1>${result.content}` }} className="prose prose-sm max-w-none text-sm leading-relaxed" />
          </div>
          {result.faqs?.length > 0 && (
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs font-semibold mb-2">FAQ Schema (ready for structured data)</div>
              {result.faqs.map((faq: any, i: number) => (
                <div key={i} className="text-xs mb-1.5"><strong>Q:</strong> {faq.question}<br /><strong>A:</strong> {faq.answer}</div>
              ))}
            </div>
          )}
          <Button variant="outline" onClick={copyContent} className="w-full gap-1.5"><Copy className="h-3.5 w-3.5" />Copy Full HTML</Button>
        </div>
      )}
    </div>
  );
}

// --- Schema Injector ---
function SchemaInjector({ token }: { token: string }) {
  const { data, loading } = useFetch<{ injectScript: string; features: string[]; instructions: string[] }>(`/api/client/${token}/inject-schema`);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const copy = () => { if (data?.injectScript) { navigator.clipboard.writeText(data.injectScript); setCopied(true); setTimeout(() => setCopied(false), 2000); toast({ title: "Schema injector copied!" }); } };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">One script tag that <strong>auto-injects all schema markup</strong> into your site. No code changes needed on individual pages.</p>
      {loading ? <div className="py-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div> : data ? (
        <>
          <div className="relative">
            <pre className="max-h-48 overflow-auto rf-scroll rounded-lg border bg-muted/40 p-3 text-[10px] font-mono"><code>{data.injectScript}</code></pre>
            <Button size="sm" variant={copied ? "default" : "outline"} onClick={copy} className="absolute top-2 right-2 gap-1">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? "Copied!" : "Copy"}</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.features.map((f, i) => <div key={i} className="flex items-start gap-2 rounded-lg border bg-card p-2 text-xs"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}</div>)}
          </div>
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs"><strong>How to use:</strong> Paste the script just before <code className="font-mono">&lt;/body&gt;</code>. That's it — schema is auto-injected on every page.</div>
        </>
      ) : <div className="text-sm text-muted-foreground">Failed to load.</div>}
    </div>
  );
}

// --- PageSpeed Insights ---
function PageSpeedInsights({ token }: { token: string }) {
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const { data, loading, error } = useFetch<any>(`/api/client/${token}/pagespeed?strategy=${strategy}`);
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(["mobile", "desktop"] as const).map(s => (
          <button key={s} onClick={() => setStrategy(s)} className={cn("rounded-md px-3 py-1 text-xs font-medium capitalize", strategy === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s}</button>
        ))}
      </div>
      {loading && <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /><p className="text-xs text-muted-foreground mt-2">Running Google PageSpeed audit… (takes ~15s)</p></div>}
      {data?.error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-600">{data.error}</div>}
      {data?.scores && !loading && (
        <>
          <div className="grid grid-cols-4 gap-2">
            {[{ label: "Performance", val: data.scores.performance, color: "#10b981" }, { label: "SEO", val: data.scores.seo, color: "#0ea5e9" }, { label: "Accessibility", val: data.scores.accessibility, color: "#8b5cf6" }, { label: "Best Practices", val: data.scores.bestPractices, color: "#f59e0b" }].map(s => (
              <div key={s.label} className="rounded-lg border bg-card p-2 text-center">
                <div className={cn("text-2xl font-bold tabular-nums", s.val >= 90 ? "text-emerald-600" : s.val >= 50 ? "text-amber-600" : "text-rose-600")}>{s.val}</div>
                <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          {data.labData?.lcp && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {["lcp", "fcp", "cls", "tbt"].map(k => data.labData[k] ? (
              <div key={k} className="rounded border bg-card p-2"><div className="font-semibold uppercase text-[9px] text-muted-foreground">{k}</div><div className="font-mono">{data.labData[k].displayValue}</div></div>
            ) : null)}
          </div>}
          {data.opportunities?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Speed Optimization Opportunities</div>
              <div className="space-y-1.5">{data.opportunities.map((o: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded border bg-card p-2 text-xs">
                  <span className="flex-1 truncate">{o.title}</span>
                  <Badge variant="secondary" className="ml-2 text-[9px]">Save {o.savingsMs}ms</Badge>
                </div>
              ))}</div>
            </div>
          )}
          <div className="text-[10px] text-muted-foreground text-center">Real data from Google PageSpeed Insights API · {data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : ""}</div>
        </>
      )}
    </div>
  );
}

// --- Daily Crawl ---
function DailyCrawl({ token }: { token: string }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const run = async () => {
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`/api/client/${token}/daily-crawl`);
      const j = await r.json();
      setResult(j);
      toast({ title: "Daily crawl complete!", description: `${j.newIssuesFound} new issues, ${j.issuesResolved} resolved` });
    } catch { toast({ title: "Crawl failed", variant: "destructive" }); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Automated daily crawl that detects <strong>new issues</strong> and auto-generates alerts. Can be scheduled via cron.</p>
      <Button onClick={run} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
        {loading ? "Crawling…" : "Run Daily Crawl Now"}
      </Button>
      {result && !loading && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Real Score" value={result.realScore} />
            <MiniStat label="New Issues" value={result.newIssuesFound} color="text-rose-600" />
            <MiniStat label="Resolved" value={result.issuesResolved} color="text-emerald-600" />
          </div>
          {result.newIssues?.length > 0 && <div className="rounded-lg border bg-card p-2 space-y-1">{result.newIssues.map((i: any, idx: number) => <div key={idx} className="text-xs flex items-center gap-2"><AlertCircle className={cn("h-3 w-3", i.severity === "critical" ? "text-rose-500" : "text-amber-500")} />{i.title}</div>)}</div>}
          {result.issuesResolved > 0 && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-emerald-600">✓ {result.issuesResolved} previously open issues are now resolved!</div>}
          <div className="text-[10px] text-muted-foreground">Crawled at {new Date(result.crawledAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

// --- A/B Testing ---
function ABTesting({ token }: { token: string }) {
  const { data, loading } = useFetch<{ tests: any[] }>(`/api/client/${token}/ab-test`);
  if (loading) return <div className="py-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;
  if (!data?.tests) return <div className="text-sm text-muted-foreground">No test data.</div>;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Test different title tags & meta descriptions. GuardianX tracks CTR and declares a winner.</p>
      {data.tests.map((t, i) => (
        <div key={i} className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate">{t.keyword}</span>
            <Badge variant="outline" className={cn("text-[9px] capitalize", t.status === "running" ? "text-emerald-600" : t.status === "completed" ? "text-sky-600" : "text-muted-foreground")}>{t.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={cn("rounded border p-2", t.winner === "A" && "border-emerald-500/30 bg-emerald-500/5")}>
              <div className="font-semibold">Variant A</div>
              <div className="text-muted-foreground truncate">{t.variantA.title}</div>
              <div className="mt-1">CTR: <strong>{t.variantA.ctr.toFixed(1)}%</strong> · {t.variantA.impressions} imp</div>
            </div>
            <div className={cn("rounded border p-2", t.winner === "B" && "border-emerald-500/30 bg-emerald-500/5")}>
              <div className="font-semibold">Variant B</div>
              <div className="text-muted-foreground truncate">{t.variantB.title}</div>
              <div className="mt-1">CTR: <strong>{t.variantB.ctr.toFixed(1)}%</strong> · {t.variantB.impressions} imp</div>
            </div>
          </div>
          {t.winner && <div className="mt-2 text-xs text-emerald-600"><Trophy className="h-3 w-3 inline mr-1" />Winner: Variant {t.winner} — {t.improvement}% CTR improvement (+{t.estimatedTrafficGain} visitors/mo)</div>}
        </div>
      ))}
    </div>
  );
}

// --- White Label ---
function WhiteLabel({ token }: { token: string }) {
  const { data, loading } = useFetch<any>(`/api/client/${token}/whitelabel`);
  if (loading) return <div className="py-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Customize the branding on your client portals. Add your agency name, logo, and colors.</p>
      {data && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div><Label className="text-xs">Agency Name</Label><Input defaultValue={data.agencyName} className="h-9" /></div>
            <div><Label className="text-xs">Logo Text</Label><Input defaultValue={data.logoText} maxLength={2} className="h-9" /></div>
            <div><Label className="text-xs">Primary Color</Label><div className="flex gap-2"><Input defaultValue={data.primaryColor} className="h-9" /><input type="color" defaultValue={data.primaryColor} className="h-9 w-12 rounded border" /></div></div>
            <div><Label className="text-xs">Custom Domain</Label><Input placeholder="seo.youragency.com" className="h-9" /></div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" id="hide-gx" className="rounded" /><Label htmlFor="hide-gx" className="text-xs">Hide "Powered by GuardianX-SEO" branding</Label></div>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1.5"><Palette className="h-4 w-4" />Save Branding</Button>
          <div className="rounded-lg border bg-muted/20 p-3 text-xs"><div className="font-semibold mb-1">Preview</div><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold" style={{ backgroundColor: data.primaryColor }}>{data.logoText}</span><span className="font-bold text-sm">{data.agencyName}</span></div></div>
        </div>
      )}
    </div>
  );
}

// --- Integrations (GSC, GA4, SERP API, WhatsApp, Telegram) ---
function Integrations({ token }: { token: string }) {
  const { data, loading } = useFetch<{ integrations: any[] }>(`/api/client/${token}/settings`);
  const iconMap: Record<string, any> = { Search, BarChart3, Globe, MessageCircle, Send };
  if (loading) return <div className="py-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Connect external tools for real data. These integrations replace simulated data with live API feeds.</p>
      {data?.integrations.map((integ) => {
        const Icon = iconMap[integ.icon] || Plug;
        return (
          <div key={integ.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium">{integ.name}</span><Badge variant="outline" className="text-[9px] capitalize">{integ.status.replace("-", " ")}</Badge></div>
                  <p className="text-xs text-muted-foreground mt-0.5">{integ.description}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">{integ.benefits.map((b: string, i: number) => <Badge key={i} variant="secondary" className="text-[9px]">{b}</Badge>)}</div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1 shrink-0">{integ.status === "connected" ? <><Check className="h-3 w-3" />Connected</> : <><Plug className="h-3 w-3" />Connect</>}</Button>
            </div>
            {integ.requiresKey && (
              <div className="mt-2 pt-2 border-t">
                <Label className="text-xs">{integ.keyLabel}</Label>
                <Input type="password" placeholder={`Enter your ${integ.name} API key`} className="h-8 mt-1" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: any; color?: string }) {
  return <div className="rounded border bg-card p-2 text-center"><div className={cn("text-lg font-bold tabular-nums", color)}>{value}</div><div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div></div>;
}
