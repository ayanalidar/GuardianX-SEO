"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanySummary, DomainWithCompanies } from "@/lib/seo/types";
import { useNav } from "@/store/nav";
import { formatNumber, formatPercent } from "@/lib/seo/hooks";
import { scoreGrade } from "@/lib/seo/score";
import {
  Globe, MapPin, Users, Calendar, TrendingUp, TrendingDown,
  Link2, KeyRound, AlertTriangle, ArrowRight, Check, GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CompanyCard({
  company,
  domain,
}: {
  company: CompanySummary;
  domain: DomainWithCompanies;
}) {
  const openCompany = useNav((s) => s.openCompany);
  const compareMode = useNav((s) => s.compareMode);
  const compareIds = useNav((s) => s.compareIds);
  const toggleCompareId = useNav((s) => s.toggleCompareId);

  const latest = company.latest;
  const score = latest ? Math.round(latest.visibilityScore) : 0;
  const grade = scoreGrade(score);
  const trafficUp = company.trafficDelta >= 0;
  const isSelected = compareIds.includes(company.id);

  const handleClick = () => {
    if (compareMode) {
      toggleCompareId(company.id);
    } else {
      openCompany(company.id, company.slug, domain.slug);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "group relative p-0 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rf-gradient-border",
        compareMode && isSelected && "ring-2 ring-emerald-500/60 shadow-lg"
      )}
    >
      {/* accent strip */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: domain.accent }}
      />
      {compareMode && isSelected && (
        <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
          <Check className="h-4 w-4" />
        </div>
      )}
      {compareMode && !isSelected && (
        <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground/60">
          <GitCompare className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="p-5 space-y-4">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: domain.accent }}
            >
              {company.logoText}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base leading-tight truncate">
                {company.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Globe className="h-3 w-3" />
                <span className="truncate">{company.website}</span>
              </div>
            </div>
          </div>
          {/* mini score */}
          <div className="shrink-0 flex flex-col items-center">
            <div
              className="text-xl font-bold tabular-nums"
              style={{ color: grade.color }}
            >
              {score}
            </div>
            <div
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: grade.color }}
            >
              {grade.grade}
            </div>
          </div>
        </div>

        {/* description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {company.description}
        </p>

        {/* meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {company.location.split(",")[0]}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {company.employees}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {company.foundedYear}
          </span>
        </div>

        {/* metrics */}
        {latest && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Organic Traffic
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-bold tabular-nums">
                  {formatNumber(latest.organicTraffic)}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] font-semibold",
                    trafficUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {trafficUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(company.trafficDelta).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Avg Position
              </div>
              <div className="text-base font-bold tabular-nums mt-0.5">
                #{latest.avgPosition.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Domain Authority
              </div>
              <div className="text-base font-bold tabular-nums mt-0.5">
                {latest.domainAuthority.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Keywords
              </div>
              <div className="text-base font-bold tabular-nums mt-0.5">
                {formatNumber(latest.keywordsRanked)}
              </div>
            </div>
          </div>
        )}

        {/* footer stats */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <KeyRound className="h-3.5 w-3.5" />
              {company.kwCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Link2 className="h-3.5 w-3.5" />
              {formatNumber(company.blCount)}
            </span>
            {company.issueCount > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5 gap-1">
                <AlertTriangle className="h-3 w-3" />
                {company.issueCount} issues
              </Badge>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
            Open
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Card>
  );
}
