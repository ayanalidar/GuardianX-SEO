"use client";

import { useEffect } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { DomainTabs } from "./domain-tabs";
import { Overview } from "./overview";
import { CompanyDetail } from "./company-detail";
import { SearchDialog } from "./search-dialog";
import { CompareView, CompareBar } from "./compare-view";
import { OnboardingWizard } from "./onboarding-wizard";
import { CommandPalette } from "./command-palette";
import { ShortcutsOverlay } from "./shortcuts-overlay";
import { MarketingSite } from "./marketing/marketing-site";
import { useNav } from "@/store/nav";
import { useFetch } from "@/lib/seo/hooks";
import { DomainWithCompanies } from "@/lib/seo/types";

export function AppShell() {
  const view = useNav((s) => s.view);
  const setDomain = useNav((s) => s.setDomain);

  const { data, loading } = useFetch<{ domains: DomainWithCompanies[] }>(
    "/api/domains"
  );
  const domains = data?.domains ?? [];

  // Sync with URL query params (only `/` route is allowed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cId = params.get("c");
    const dSlug = params.get("d");
    const cSlug = params.get("cs");
    const cmp = params.get("cmp");
    const app = params.get("app");
    const page = params.get("p"); // marketing page
    if (cmp) {
      const ids = cmp.split(",").filter(Boolean);
      if (ids.length >= 2) useNav.getState().openCompare(ids);
    } else if (cId && cSlug && dSlug) {
      useNav.getState().openCompany(cId, cSlug, dSlug);
    } else if (dSlug) {
      setDomain(dSlug);
    } else if (app === "1") {
      useNav.getState().enterApp();
    } else if (page) {
      const valid = ["home", "industries", "capabilities", "auth"];
      if (valid.includes(page)) useNav.getState().setMarketingPage(page as any);
    }
  }, [setDomain]);

  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams();
      if (view.kind === "overview") {
        params.set("app", "1");
        if (view.domainSlug) params.set("d", view.domainSlug);
      } else if (view.kind === "company") {
        params.set("c", view.companyId);
        params.set("cs", view.companySlug);
        params.set("d", view.domainSlug);
      } else if (view.kind === "compare") {
        params.set("cmp", view.companyIds.join(","));
      } else if (view.kind === "marketing") {
        if (view.page !== "home") params.set("p", view.page);
      }
      const qs = params.toString();
      const newUrl = qs ? `/?${qs}` : "/";
      window.history.replaceState(null, "", newUrl);
    };
    update();
  }, [view]);

  // Marketing site has its own header/footer
  if (view.kind === "marketing") {
    return (
      <>
        <MarketingSite domains={domains} loading={loading} />
        <SearchDialog />
        <OnboardingWizard />
        <CommandPalette domains={domains} />
        <ShortcutsOverlay />
      </>
    );
  }

  const activeSlug =
    view.kind === "overview"
      ? view.domainSlug
      : view.kind === "company"
      ? view.domainSlug
      : undefined;

  const showTabs = view.kind !== "compare";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showTabs && (
        <DomainTabs
          domains={domains}
          activeSlug={activeSlug}
          onSelect={(slug) => setDomain(slug === "all" ? "" : slug)}
        />
      )}
      <main className="flex-1">
        {view.kind === "overview" ? (
          <Overview domains={domains} activeSlug={activeSlug || "all"} loading={loading} />
        ) : view.kind === "company" ? (
          <CompanyDetail companyId={view.companyId} />
        ) : (
          <CompareView companyIds={view.companyIds} />
        )}
      </main>
      <Footer />
      <SearchDialog />
      <CompareBar domains={domains} />
      <OnboardingWizard />
      <CommandPalette domains={domains} />
      <ShortcutsOverlay />
    </div>
  );
}
