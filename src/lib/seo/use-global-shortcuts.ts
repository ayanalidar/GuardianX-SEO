"use client";

import { useEffect, useRef } from "react";
import { useNav } from "@/store/nav";
import { useSavedViews } from "@/store/saved-views";
import { useTheme } from "next-themes";

/**
 * Global keyboard shortcuts hook.
 * Implements the shortcuts documented in the shortcuts overlay:
 * - G then D/H/I/C: navigation
 * - N: onboard client
 * - C: toggle compare
 * - B: bookmark current view (only in company view)
 * - T: toggle theme
 * - 1-9: switch tabs (handled in company detail, not here)
 */
export function useGlobalShortcuts() {
  const nav = useNav();
  const { views, addView, removeView, hasView } = useSavedViews();
  const { setTheme } = useTheme();
  const pendingKey = useRef<string | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTyping) return;

      // Ignore if any dialog is open (Radix sets aria-hidden on body)
      if (document.body.getAttribute("aria-hidden") === "true") return;
      // Ignore modifier combos (⌘K etc handled elsewhere)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // G-prefix sequences
      if (key === "g") {
        pendingKey.current = "g";
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        pendingTimer.current = setTimeout(() => {
          pendingKey.current = null;
        }, 800);
        return;
      }
      if (pendingKey.current === "g") {
        if (key === "d") { e.preventDefault(); nav.enterApp(); }
        else if (key === "h") { e.preventDefault(); nav.setMarketingPage("home"); }
        else if (key === "i") { e.preventDefault(); nav.setMarketingPage("industries"); }
        else if (key === "c") { e.preventDefault(); nav.setMarketingPage("capabilities"); }
        pendingKey.current = null;
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        return;
      }

      // Single-key actions
      if (key === "n") {
        e.preventDefault();
        nav.setOnboarding(true);
      } else if (key === "c") {
        e.preventDefault();
        if (nav.view.kind === "overview") {
          nav.toggleCompareMode();
        }
      } else if (key === "b") {
        // Bookmark current view (only in company view)
        e.preventDefault();
        if (nav.view.kind === "company") {
          const v = nav.view;
          // We don't have the company name here, but use slug
          if (hasView(v.companyId)) {
            const match = views.find((x) => x.companyId === v.companyId && x.tab === undefined);
            if (match) removeView(match.id);
          } else {
            addView({
              companyId: v.companyId,
              companySlug: v.companySlug,
              domainSlug: v.domainSlug,
              label: v.companySlug,
            });
          }
        }
      } else if (key === "t") {
        e.preventDefault();
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "light" : "dark");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nav, views, addView, removeView, hasView, setTheme]);
}
