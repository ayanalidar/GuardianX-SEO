"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const SHORTCUTS = [
  { group: "Global", keys: [
    { combo: "⌘ K", desc: "Open command palette" },
    { combo: "⌘ K", desc: "Open search (same)" },
    { combo: "?", desc: "Show this shortcuts overlay" },
    { combo: "esc", desc: "Close any dialog" },
  ]},
  { group: "Navigation", keys: [
    { combo: "G then D", desc: "Go to Dashboard" },
    { combo: "G then H", desc: "Go to Home (marketing)" },
    { combo: "G then I", desc: "Go to Industries" },
    { combo: "G then C", desc: "Go to Capabilities" },
  ]},
  { group: "Actions", keys: [
    { combo: "N", desc: "Onboard a new client" },
    { combo: "C", desc: "Toggle compare mode" },
    { combo: "B", desc: "Bookmark current view" },
    { combo: "T", desc: "Toggle theme" },
  ]},
  { group: "Dashboard", keys: [
    { combo: "↑ ↓", desc: "Navigate command palette results" },
    { combo: "↵", desc: "Select highlighted action" },
    { combo: "1-9", desc: "Switch to tab N (in company view)" },
  ]},
];

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ? (Shift+/) toggles, but ignore if typing in an input
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isTyping) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden top-[12%] translate-y-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-4 w-4 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rf-scroll p-5">
          <div className="grid gap-6 sm:grid-cols-2">
            {SHORTCUTS.map((group) => (
              <div key={group.group}>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 rf-section-heading">
                  {group.group}
                </div>
                <div className="space-y-1.5">
                  {group.keys.map((k, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/40 transition-colors">
                      <span className="text-sm text-muted-foreground">{k.desc}</span>
                      <kbd className="inline-flex items-center gap-0.5 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                        {k.combo}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t px-5 py-3 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-semibold">?</kbd> anytime to toggle this overlay
        </div>
      </DialogContent>
    </Dialog>
  );
}
