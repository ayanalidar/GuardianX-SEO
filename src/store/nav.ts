"use client";

import { create } from "zustand";

export type View =
  | { kind: "overview"; domainSlug?: string }
  | { kind: "company"; companyId: string; companySlug: string; domainSlug: string };

interface NavState {
  view: View;
  searchOpen: boolean;
  setDomain: (slug: string) => void;
  openCompany: (
    companyId: string,
    companySlug: string,
    domainSlug: string
  ) => void;
  backToOverview: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useNav = create<NavState>((set) => ({
  view: { kind: "overview", domainSlug: undefined },
  searchOpen: false,
  setDomain: (slug) =>
    set({ view: { kind: "overview", domainSlug: slug } }),
  openCompany: (companyId, companySlug, domainSlug) =>
    set({ view: { kind: "company", companyId, companySlug, domainSlug } }),
  backToOverview: () =>
    set((s) => ({
      view: {
        kind: "overview",
        domainSlug:
          s.view.kind === "company" ? s.view.domainSlug : s.view.domainSlug,
      },
    })),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
