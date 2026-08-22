"use client";

import { create } from "zustand";

export type View =
  | { kind: "overview"; domainSlug?: string }
  | { kind: "company"; companyId: string; companySlug: string; domainSlug: string }
  | { kind: "compare"; companyIds: string[] };

interface NavState {
  view: View;
  searchOpen: boolean;
  compareMode: boolean;
  compareIds: string[];
  onboarding: boolean;
  setDomain: (slug: string) => void;
  openCompany: (
    companyId: string,
    companySlug: string,
    domainSlug: string
  ) => void;
  backToOverview: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleCompareMode: () => void;
  toggleCompareId: (id: string) => void;
  clearCompare: () => void;
  openCompare: (ids: string[]) => void;
  setOnboarding: (open: boolean) => void;
}

export const useNav = create<NavState>((set) => ({
  view: { kind: "overview", domainSlug: undefined },
  searchOpen: false,
  compareMode: false,
  compareIds: [],
  onboarding: false,
  setDomain: (slug) =>
    set({ view: { kind: "overview", domainSlug: slug } }),
  openCompany: (companyId, companySlug, domainSlug) =>
    set({ view: { kind: "company", companyId, companySlug, domainSlug }, compareMode: false }),
  backToOverview: () =>
    set((s) => ({
      view: {
        kind: "overview",
        domainSlug:
          s.view.kind === "company" ? s.view.domainSlug : s.view.domainSlug,
      },
      compareMode: false,
    })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleCompareMode: () =>
    set((s) => ({ compareMode: !s.compareMode, compareIds: s.compareMode ? [] : s.compareIds })),
  toggleCompareId: (id) =>
    set((s) => {
      const exists = s.compareIds.includes(id);
      if (exists) {
        const next = s.compareIds.filter((x) => x !== id);
        return { compareIds: next };
      }
      if (s.compareIds.length >= 4) return s; // max 4
      return { compareIds: [...s.compareIds, id] };
    }),
  clearCompare: () => set({ compareIds: [], compareMode: false }),
  openCompare: (ids) =>
    set({ view: { kind: "compare", companyIds: ids }, compareMode: false }),
  setOnboarding: (open) => set({ onboarding: open }),
}));
