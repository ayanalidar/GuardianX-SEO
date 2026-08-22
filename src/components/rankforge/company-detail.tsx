"use client";

import { useNav } from "@/store/nav";
import { useFetch, formatNumber, formatPercent } from "@/lib/seo/hooks";
import { CompanyDetail as Detail } from "@/lib/seo/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "./score-ring";
import { StatCard } from "./stat-card";
import {
  TrafficChart, VisibilityChart, PositionDistribution,
  AuthorityChart,
} from "./charts";
import {
  KeywordTable, BacklinksPanel, CompetitorsPanel,
  TechnicalIssuesPanel, ContentGapsPanel, AiInsightsPanel,
  CoreWebVitalsPanel, SerpFeaturesPanel,
} from "./panels";
import { DomainIcon } from "./icons";
import { scoreGrade } from "@/lib/seo/score";
import {
  ArrowLeft, Globe, MapPin, Users, Calendar, Building2,
  Activity, KeyRound, Link2, Gauge, Eye, TrendingUp,
  Search, Target, Shield, Lightbulb, Bot, ChevronRight,
  Zap, Layers,
} from "lucide-react";

export function CompanyDetail({ companyId }: { companyId: string }) {
  const { data, loading, error } = useFetch<Detail>(`/api/companies/${companyId}`);
  const backToOverview = useNav((s) => s.backToOverview);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-16 text-center">
        <p className="text-muted-foreground">Failed to load company data.</p>
        <Button variant="outline" className="mt-4" onClick={backToOverview}>
          Back to overview
        </Button>
      </div>
    );
  }

  const { company, domain, latest, seoScore, metrics } = data;

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 space-y-6">
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={backToOverview}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Overview
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{domain.name}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{company.name}</span>
      </div>

      {/* Company header */}
      <Card className="overflow-hidden">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: domain.accent }}
        />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* left: logo + info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg"
                style={{ backgroundColor: domain.accent }}
              >
                {company.logoText}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{company.name}</h1>
                  <Badge
                    variant="secondary"
                    className="gap-1"
                    style={{ backgroundColor: `${domain.accent}1a`, color: domain.accent }}
                  >
                    <DomainIcon name={domain.icon} className="h-3 w-3" />
                    {domain.name}
                  </Badge>
                </div>
                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {company.website}
                </a>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {company.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {company.industry}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {company.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {company.employees} employees
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Est. {company.foundedYear}
                  </span>
                </div>
              </div>
            </div>

            {/* right: score ring */}
            <div className="flex items-center gap-6 shrink-0 self-center">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  SEO Health Score
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Composite ranking
                </div>
              </div>
              <ScoreRing score={seoScore.total} size={130} />
            </div>
          </div>

          {/* Score breakdown bar */}
          <div className="mt-6 pt-6 border-t">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">
              Score Breakdown
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {seoScore.breakdown.map((b) => (
                <div key={b.label} className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{b.label}</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {Math.round(b.weight * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums" style={{ color: scoreGrade(b.score).color }}>
                    {b.score}
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${b.score}%`, backgroundColor: scoreGrade(b.score).color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={Activity}
          label="Organic Traffic"
          value={latest ? formatNumber(latest.organicTraffic) : "—"}
          delta={data.trafficDelta}
          accent="#10b981"
        />
        <StatCard
          icon={KeyRound}
          label="Keywords Ranked"
          value={latest ? formatNumber(latest.keywordsRanked) : "—"}
          sub={`${data.keywords.length} tracked`}
          accent="#14b8a6"
        />
        <StatCard
          icon={Gauge}
          label="Avg Position"
          value={latest ? `#${latest.avgPosition.toFixed(1)}` : "—"}
          sub={latest ? `Visibility ${latest.visibilityScore.toFixed(0)}%` : ""}
          accent="#f59e0b"
        />
        <StatCard
          icon={Eye}
          label="Domain Authority"
          value={latest ? latest.domainAuthority.toFixed(1) : "—"}
          sub={latest ? `PA ${latest.pageAuthority.toFixed(0)}` : ""}
          accent="#8b5cf6"
        />
        <StatCard
          icon={Link2}
          label="Backlinks"
          value={latest ? formatNumber(latest.backlinks) : "—"}
          sub={`${data.backlinkStats.dofollow} dofollow`}
          accent="#06b6d4"
        />
        <StatCard
          icon={Search}
          label="Impressions"
          value={latest ? formatNumber(latest.impressions) : "—"}
          sub={latest ? `CTR ${latest.ctr.toFixed(1)}%` : ""}
          accent="#0ea5e9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto rf-scroll h-auto flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-1.5">
            <KeyRound className="h-3.5 w-3.5" /> Keywords
          </TabsTrigger>
          <TabsTrigger value="backlinks" className="gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> Backlinks
          </TabsTrigger>
          <TabsTrigger value="competitors" className="gap-1.5">
            <Target className="h-3.5 w-3.5" /> Competitors
          </TabsTrigger>
          <TabsTrigger value="technical" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Technical
          </TabsTrigger>
          <TabsTrigger value="cwv" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Core Web Vitals
          </TabsTrigger>
          <TabsTrigger value="serp" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" /> SERP Features
          </TabsTrigger>
          <TabsTrigger value="gaps" className="gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" /> Content Gaps
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Bot className="h-3.5 w-3.5" /> AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Organic Traffic (30 days)
                </CardTitle>
                <CardDescription>
                  {latest ? `${formatNumber(latest.organicTraffic)} visits` : "—"} ·{" "}
                  <span className={data.trafficDelta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {formatPercent(data.trafficDelta)}
                  </span> vs 30 days ago
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrafficChart metrics={metrics} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4 text-teal-500" />
                  Visibility vs Avg Position
                </CardTitle>
                <CardDescription>
                  SERP visibility % vs average ranking position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VisibilityChart metrics={metrics} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Keyword Distribution</CardTitle>
                <CardDescription>By SERP position bucket</CardDescription>
              </CardHeader>
              <CardContent>
                <PositionDistribution buckets={data.positionBuckets} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Domain & Page Authority</CardTitle>
                <CardDescription>Authority trend over 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <AuthorityChart metrics={metrics} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          <KeywordTable keywords={data.keywords} companyId={company.id} />
        </TabsContent>

        <TabsContent value="backlinks">
          <BacklinksPanel detail={data} />
        </TabsContent>

        <TabsContent value="competitors">
          <CompetitorsPanel competitors={data.competitors} companyName={company.name} />
        </TabsContent>

        <TabsContent value="technical">
          <TechnicalIssuesPanel issues={data.issues} stats={data.issueStats} />
        </TabsContent>

        <TabsContent value="cwv">
          <CoreWebVitalsPanel detail={data} />
        </TabsContent>

        <TabsContent value="serp">
          <SerpFeaturesPanel detail={data} />
        </TabsContent>

        <TabsContent value="gaps">
          <ContentGapsPanel gaps={data.contentGaps} />
        </TabsContent>

        <TabsContent value="ai">
          <AiInsightsPanel companyId={company.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
