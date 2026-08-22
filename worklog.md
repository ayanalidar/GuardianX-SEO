# RankForge SEO — Project Worklog

---
Task ID: 1-9
Agent: main (Z.ai Code)
Task: Build an advanced multi-domain SEO optimization platform ("RankForge SEO") with domain tabs, separate company pages, rank tracking, technical audits, backlink analysis, content gaps, competitor analysis, and AI-powered insights.

Work Log:
- Explored existing Next.js 16 scaffold (Prisma, shadcn/ui, recharts, z-ai-web-dev-sdk all available; dev server running on port 3000).
- Designed Prisma schema with 8 models: Domain, Company, SeoMetric (30-day time series), Keyword (with trend JSON), Backlink, Competitor, TechnicalIssue, ContentGap, SeoInsight.
- Wrote comprehensive seed script (`prisma/seed.ts`) generating realistic data for 10 business domains × 5 companies = 50 companies, with 1500 metric snapshots, 1000 keywords, 900 backlinks, 250 competitors, 600 technical issues, 800 content gaps.
- Pushed schema (`bun run db:push`) and seeded the database.
- Customized `globals.css` with an emerald/teal "growth" SEO theme (light + dark), custom scrollbar, hero glow.
- Updated `layout.tsx` with SEO metadata and added a `ThemeProvider` (next-themes) for light/dark support.
- Built 6 API routes: `/api/domains`, `/api/companies`, `/api/companies/[id]` (full SEO profile), `/api/companies/[id]/insights` (POST — LLM-powered), `/api/search`.
- Created composite SEO scoring engine (`src/lib/seo/score.ts`) — weighted blend of visibility, technical health, keyword performance, backlink authority, and page experience.
- Built Zustand navigation store (`src/store/nav.ts`) with URL query-param sync (only `/` route used).
- Built full frontend component suite in `src/components/rankforge/`:
  - `app-shell.tsx`, `header.tsx`, `footer.tsx`, `domain-tabs.tsx`, `overview.tsx`, `company-card.tsx`
  - `company-detail.tsx` (7-tab dashboard), `charts.tsx` (recharts: traffic area, visibility line, position distribution bar, authority area, backlink pie, sparklines, radial)
  - `panels.tsx` (keyword table, backlinks, competitors, technical issues, content gaps, AI insights)
  - `score-ring.tsx`, `stat-card.tsx`, `search-dialog.tsx`, `icons.tsx`, `theme-provider.tsx`
- Wired AI insights to z-ai-web-dev-sdk LLM with strict JSON output, robust parsing, and DB persistence.
- Fixed lint errors: refactored `useFetch` and search dialog to use the React 19 "store previous value in state" pattern (avoids `set-state-in-effect` and `refs-in-render` rule violations); created static `DomainIcon` wrapper to satisfy `static-components` rule; removed mounted effect in header using CSS-based dark-mode icon toggle.
- Fixed critical seed bug: trend bias values were double-multiplied by 100, producing absurd metrics (position #158 trillion, DA 1390). Removed the extra `* 100` on `daBias` and `posBias` and re-seeded — data is now realistic (scores 21-76, positions 6-25, DA 47-83).
- Verified end-to-end with agent-browser: overview renders, domain filtering works, company detail 7-tab dashboard loads, AI insights generate real data-driven recommendations (POST 200 in ~10s), search dialog returns companies + keywords with debounce. No runtime errors.

Stage Summary:
- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind 4 + shadcn/ui + Prisma (SQLite) + Recharts + Zustand + z-ai-web-dev-sdk (LLM).
- **Data**: 10 domains, 50 companies, 1500 metric snapshots, 1000 keywords, 900 backlinks, 250 competitors, 600 issues, 800 content gaps.
- **Features delivered**: domain tabs, company cards with mini scores, full SEO dashboard (score ring + breakdown, 6 KPI cards, traffic/visibility/authority charts, position distribution, keyword rank tracking table with sparklines, backlink profile + dofollow/nofollow pie, competitor comparison, technical SEO audit with severity cards, content gap opportunities, AI-powered insight generation).
- **Lint**: clean (0 errors, 0 warnings).
- **Verification**: agent-browser confirmed interactive on both desktop (1440×900) and mobile (390×844). Sticky footer via `min-h-screen flex flex-col` + `flex-1` main. No blue/indigo — emerald/teal growth theme throughout.
- **Known transient**: stale URL `?c=` params after re-seed produce a one-time 404 on the company detail fetch (self-heals on navigation). Harmless.

Unresolved / Next-phase recommendations:
- The `/api/domains` route does N+1 queries (latest metric + counts per company). Could be optimized with a single grouped query or a materialized view for larger datasets.
- AI insights are generated on-demand; could add a "regenerate" / "clear" affordance and dedup.
- Add export (CSV/PDF) for keyword/backlink reports.
- Add a comparison view (multiple companies side-by-side).
- Consider adding SERP feature tracking, internal-link analysis, and Core Web Vitals deep-dive panels.
