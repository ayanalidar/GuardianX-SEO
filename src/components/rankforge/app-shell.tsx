"use client";

import { useEffect } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { DomainTabs } from "./domain-tabs";
import { Overview } from "./overview";
import { CompanyDetail } from "./company-detail";
import { SearchDialog } from "./search-dialog";
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
    if (cId && cSlug && dSlug) {
      useNav.getState().openCompany(cId, cSlug, dSlug);
    } else if (dSlug) {
      setDomain(dSlug);
    }
  }, [setDomain]);

  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams();
      if (view.kind === "overview") {
        if (view.domainSlug) params.set("d", view.domainSlug);
      } else {
        params.set("c", view.companyId);
        params.set("cs", view.companySlug);
        params.set("d", view.domainSlug);
      }
      const qs = params.toString();
      const newUrl = qs ? `/?${qs}` : "/";
      window.history.replaceState(null, "", newUrl);
    };
    update();
  }, [view]);

  const activeSlug =
    view.kind === "overview" ? view.domainSlug : view.domainSlug;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DomainTabs
        domains={domains}
        activeSlug={activeSlug}
        onSelect={(slug) => setDomain(slug === "all" ? "" : slug)}
      />
      <main className="flex-1">
        {view.kind === "overview" ? (
          <Overview domains={domains} activeSlug={activeSlug || "all"} loading={loading} />
        ) : (
          <CompanyDetail companyId={view.companyId} />
        )}
      </main>
      <Footer />
      <SearchDialog />
    </div>
  );
}
