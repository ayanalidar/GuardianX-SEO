"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedView = {
  id: string;
  label: string;
  companyId: string;
  companySlug: string;
  domainSlug: string;
  tab?: string;
  createdAt: number;
};

type SavedViewsState = {
  views: SavedView[];
  addView: (v: Omit<SavedView, "id" | "createdAt">) => void;
  removeView: (id: string) => void;
  hasView: (companyId: string, tab?: string) => boolean;
  clearAll: () => void;
};

export const useSavedViews = create<SavedViewsState>()(
  persist(
    (set, get) => ({
      views: [],
      addView: (v) =>
        set((s) => {
          // dedupe by companyId+tab
          const exists = s.views.find(
            (x) => x.companyId === v.companyId && x.tab === v.tab
          );
          if (exists) return s;
          return {
            views: [
              { ...v, id: `${v.companyId}-${v.tab ?? "default"}-${Date.now()}`, createdAt: Date.now() },
              ...s.views,
            ].slice(0, 30), // max 30
          };
        }),
      removeView: (id) =>
        set((s) => ({ views: s.views.filter((v) => v.id !== id) })),
      hasView: (companyId, tab) =>
        get().views.some((v) => v.companyId === companyId && v.tab === tab),
      clearAll: () => set({ views: [] }),
    }),
    { name: "rankforge-saved-views" }
  )
);
