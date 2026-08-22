"use client";

import { DomainIcon } from "./icons";
import { DomainWithCompanies } from "@/lib/seo/types";
import { cn } from "@/lib/utils";

export function DomainTabs({
  domains,
  activeSlug,
  onSelect,
}: {
  domains: DomainWithCompanies[];
  activeSlug?: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="sticky top-16 z-30 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-2 md:px-6">
        <div className="flex items-stretch gap-1 overflow-x-auto rf-scroll py-2">
          <button
            onClick={() => onSelect("all")}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              !activeSlug || activeSlug === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All Domains
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                !activeSlug || activeSlug === "all"
                  ? "bg-primary-foreground/20"
                  : "bg-muted"
              )}
            >
              {domains.reduce((s, d) => s + d.companies.length, 0)}
            </span>
          </button>
          {domains.map((d) => {
            const active = activeSlug === d.slug;
            return (
              <button
                key={d.id}
                onClick={() => onSelect(d.slug)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={active ? { backgroundColor: d.accent } : undefined}
              >
                <DomainIcon name={d.icon} className="h-4 w-4" />
                {d.name}
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    active ? "bg-white/20" : "bg-muted"
                  )}
                >
                  {d.companies.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
