"use client";

import { Rocket, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background/60">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Rocket className="h-3.5 w-3.5" />
            </span>
            <span>
              <span className="font-semibold text-foreground">RankForge SEO</span>{" "}
              · Advanced multi-domain SEO optimization platform
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} RankForge</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">10 domains · 50 companies tracked</span>
            <div className="flex items-center gap-1">
              <a href="#" className="rounded-md p-1.5 hover:bg-muted transition-colors" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-md p-1.5 hover:bg-muted transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-md p-1.5 hover:bg-muted transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
