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

---
Task ID: 10 (webDevReview round 1)
Agent: main (Z.ai Code) — cron-triggered review
Task: Assess current project status, perform QA testing via agent-browser, fix bugs, and advance next-step development (improve styling + add features).

Work Log:
- Read worklog.md to understand prior state (10 domains, 50 companies, 7-tab dashboard, AI insights).
- Performed comprehensive QA via agent-browser: overview, domain filtering, company detail with all 7 tabs, search dialog, AI insights generation, dark mode, mobile (390×844). No errors found. Horizontal overflow check passed (scrollW === clientW on mobile). Lint clean.
- Extended Prisma schema with 2 new models:
  - `CoreWebVital` — per-URL/page-experience metrics (LCP, FID, CLS, INP, TTFB, FCP, score, status, mobile/desktop).
  - `SerpFeature` — SERP feature tracking (type: featured-snippet/sitelinks/reviews/faq/video/image-pack/local-pack/top-stories/people-also-ask; captured vs competitorOwned).
  - Added relations to Company model.
- Extended seed script to generate realistic CWV data (8 URLs × 2 devices = 16 per company, 800 total) and SERP features (8-14 per company, 515 total). CWV scores derived from weighted blend of metric thresholds; trending-up companies get better vitals.
- Pushed schema (`bun run db:push`) and re-seeded database (now 10 domains, 50 companies, 1500 metrics, 1000 keywords, 900 backlinks, 250 competitors, 600 issues, 800 gaps, **800 web vitals, 515 SERP features**).
- Updated `CompanyDetail` type + company detail API to return `webVitals`, `serpFeatures`, `cwvSummary` (avg/mobile/desktop scores + good/needs/poor counts), and `serpSummary` (captured/competitorOwned + byType breakdown).
- Built 3 new UI panels in `panels.tsx`:
  - `CoreWebVitalsPanel` — 4 summary cards (avg score, good, needs-work, poor), mobile vs desktop semicircle gauges (`CwvGauge`), detailed metrics table with color-coded cells (good=green, needs=amber, poor=rose) and tooltips.
  - `SerpFeaturesPanel` — 3 summary cards (captured, capture-rate %, lost-to-competitors), feature-type breakdown grid with captured-vs-lost dual-bar, detailed SERP feature table with type icons.
  - Added `CwvGauge` chart component (semicircle radial gauge) to `charts.tsx`.
- Added 2 new tabs to the company dashboard (now 9 tabs total): "Core Web Vitals" and "SERP Features".
- Built company **Comparison View** (`compare-view.tsx`):
  - Toggle "Compare" mode from header → company cards show selection checkmarks/dashed indicators.
  - Floating glassmorphism action bar (`.rf-glass`) shows selected companies (max 4) with a "Compare (N)" button.
  - Compare view renders: company header cards (with "Leader" crown badge for top score), head-to-head metrics table (traffic, visibility, position, DA, keywords, backlinks — best value highlighted with crown + emerald ring), SEO score breakdown bars per component, top-5 keywords per company.
  - URL synced via `?cmp=id1,id2,...`.
- Added **CSV Export** (`/api/export?companyId=xxx&type=keywords|backlinks`) — returns proper `text/csv` with `Content-Disposition: attachment`. Added "Export CSV" buttons to Keyword table and Backlinks table headers, with toast notifications.
- Added **AI Insights regenerate/clear**:
  - New DELETE route `/api/companies/[id]/insights/clear`.
  - AI Insights panel now shows "Clear" button (when insights exist) and the generate button switches between "Generate Insights" / "Regenerate". Toast notifications on both actions.
- Improved styling with advanced CSS animations in `globals.css`:
  - `rf-card-enter` staggered fade-up animation (60ms delay per card).
  - `rf-gradient-text` animated gradient pan for hero headline.
  - `rf-pulse-dot` live indicator pulse in hero badge.
  - `rf-shimmer` skeleton loading.
  - `rf-glass` glassmorphism for floating bars.
  - `rf-num-emphasis` tabular-nums, `.rf-scroll-hidden`, chart bar hover transitions.
- Applied: card stagger animation to overview company grid, animated gradient to hero headline, glassmorphism to compare bar, pulsing live dot to hero badge.
- Resolved dev-server cache issue: after Prisma schema change, the running dev server held a stale `@prisma/client` module + global Prisma singleton. Fixed `src/lib/db.ts` to validate the cached client has newer models (`coreWebVital`) before reuse, and recreated if missing. (Note: required dev server restart to fully pick up new client — the sandbox process reaper kills backgrounded processes between Bash calls, so the dev server was restarted within the same long-running Bash command that also ran the API tests.)
- Final verification with agent-browser: all 9 tabs render (Overview, Keywords, Backlinks, Competitors, Technical, **Core Web Vitals**, **SERP Features**, Content Gaps, AI Insights), compare flow works end-to-end (select 3 companies → compare view with leader badges + head-to-head table), CSV exports return 200 text/csv, clear insights returns 200. Lint clean (0 errors, 0 warnings). No console/page errors.

Stage Summary:
- **New data**: +800 Core Web Vitals records (16 per company), +515 SERP features (8-14 per company).
- **New features**: Core Web Vitals dashboard (gauges + table), SERP feature tracking (breakdown + table), Company Comparison view (2-4 companies side-by-side with winner highlighting), CSV export for keywords & backlinks, AI insights regenerate/clear.
- **New API routes**: `/api/compare?ids=...`, `/api/export?companyId=...&type=...`, `DELETE /api/companies/[id]/insights/clear`.
- **Styling**: card entrance stagger, animated gradient headline, pulsing live indicator, glassmorphism compare bar, improved chart hover.
- **Tabs**: 7 → 9 (added Core Web Vitals, SERP Features).
- **Lint**: clean. **Verification**: all flows tested via agent-browser on desktop + dark mode.

Unresolved / Next-phase recommendations:
- The `/api/domains` route still does N+1 queries (could optimize with grouped queries).
- AI insights could dedupe by keyword/theme when regenerated.
- Consider adding internal-link analysis, backlink anchor-text cloud, and a keyword cannibalization detector.
- Add a "trend comparison" chart in the compare view (overlay traffic lines).
- Add PDF report export (beyond CSV).
- Consider a saved-comparisons feature (persist named comparison sets).

---
Task ID: 11 (cinematic frontend + client onboarding + unique client links)
Agent: main (Z.ai Code)
Task: Build advanced frontend with in-depth cinematic infographic animations, client onboarding with separate dashboard for each, and a unique link per client to manage/optimize their business.

Work Log:
- Read worklog.md to understand prior state (10 domains, 50 companies, 9-tab dashboard, compare view, CWV + SERP panels).
- Extended Prisma schema with 3 new models:
  - `Client` — a client/owner of a company with `token` (unique cuid for shareable link), name, email, role, primaryGoal, targetKeywords/Traffic/DA, onboardedAt, lastVisit. One-to-one with Company.
  - `ClientGoal` — goal tracking (type, label, target, current, deadline, status). Linked to Client.
  - `ClientTask` — action tasks/to-do (title, description, category, priority, status, dueDate). Linked to Client.
- Pushed schema + generated Prisma client.
- Built 4 new API routes:
  - `POST /api/onboard` — creates Company + Client in a transaction, seeds 30 days of baseline metrics (trending up from low base), creates 4 default goals (traffic/keywords/authority/position) derived from targets, and 8 default tasks based on the primary goal + industry.
  - `GET /api/client/[token]` — full client portal data (mirrors company detail + client info + goals with live progress + tasks). Updates `lastVisit` on access.
  - `GET/POST/PATCH/DELETE /api/client/[token]/goals` — goal CRUD.
  - `GET/POST/PATCH/DELETE /api/client/[token]/tasks` — task CRUD with status cycling.
- Built cinematic animation primitives in `src/components/rankforge/motion.tsx` (framer-motion):
  - `AnimatedCounter` — ticks up from 0 to value when scrolled into view (spring physics).
  - `AnimatedScoreRing` — SVG ring that fills cinematically with delay, color-coded by grade.
  - `Reveal` — scroll-triggered fade-up wrapper.
  - `StaggerContainer` / `StaggerItem` — staggered list animations.
  - `CinematicBackground` — 3 variants (orbs, grid, mesh) with floating animated gradient blobs.
- Rebuilt the Overview hero with cinematic animations: animated mesh background, staggered entrance for badge/headline/subtitle/CTA, animated platform stat counters (traffic/keywords/backlinks/DA tick up on view), "Onboard a Client" CTA button with gradient + hover lift.
- Applied scroll-reveal + stagger to domain sections and company card grids.
- Built a multi-step **Onboarding Wizard** (`onboarding-wizard.tsx`):
  - Step 1: Business info (name, website, industry, location, employees, founded year, description, domain category as icon grid).
  - Step 2: Client contact (name, email, phone, role as pill selector).
  - Step 3: Goals & targets (4 primary-goal cards with icons, target traffic/keywords/DA inputs).
  - Animated step progress bar with check icons; AnimatePresence transitions between steps.
  - Success screen: animated check spring-in, displays the unique portal link with copy button, and "Open Portal" / "View Dashboard" CTAs.
- Built the **Client Portal** at `/portal/[token]` (`client-portal.tsx` + `app/portal/[token]/page.tsx`):
  - Separate layout (own header with Share + Visit Site, no domain tabs) — a dedicated dashboard per client.
  - Welcome hero with animated score ring, client name, primary goal, onboarding date.
  - 6 animated KPI cards (counters tick up on view).
  - Goal Tracking card with animated progress bars (live progress computed from latest metrics; achieved goals get a check icon).
  - Action Plan card with task filter (all/todo/in-progress/done), overall progress bar, and click-to-cycle task status (todo→in-progress→done) persisted via PATCH API.
  - SEO Score Breakdown with animated per-component bars.
  - Mini stats footer (open issues, SERP features, CWV avg score).
  - Custom portal footer.
- Added "Onboard Client" button to the header (gradient, with UserPlus icon) next to Compare.
- Added `setOnboarding` action to the Zustand nav store + `onboarding` state.
- Fixed Prisma client cache issue: updated `src/lib/db.ts` `hasAllModels()` validation to check ALL new models (coreWebVital, serpFeature, client, clientGoal, clientTask) and recreate the client if any are missing. Required dev server restart to pick up the regenerated client (the sandbox process reaper kills backgrounded processes between Bash calls).
- Verified end-to-end with agent-browser:
  - Cinematic hero renders with animated counters and mesh background.
  - Onboarding wizard: completed full 3-step flow (Pixel Forge Studio → E-Commerce → Arjun Mehta → Increase organic traffic) → success screen with unique portal link.
  - Client portal at `/portal/[token]` loads with welcome hero, animated score ring, 6 KPI cards, goals with progress bars, tasks with click-to-cycle status, score breakdown.
  - Mobile (390×844): no horizontal overflow.
  - Direct API test: `POST /api/onboard` returns `{"success":true,"companyId":...,"clientToken":...,"portalUrl":"/portal/..."}`. Portal page + client API both return 200.
- Lint: clean (0 errors, 0 warnings). No console/page errors.

Stage Summary:
- **New models**: Client, ClientGoal, ClientTask (with shareable token-based portal access).
- **New routes**: `POST /api/onboard`, `/api/client/[token]` (GET), `/api/client/[token]/goals` (CRUD), `/api/client/[token]/tasks` (CRUD), `/portal/[token]` (client portal page).
- **Cinematic animations**: animated counters (spring physics), animated score ring fill, scroll-reveal wrappers, staggered containers, 3 cinematic background variants (orbs/grid/mesh), animated step progress bar, success-screen spring-in.
- **Client onboarding**: 3-step wizard → creates Company + Client + 30-day metrics + 4 goals + 8 tasks → generates unique `/portal/[token]` link.
- **Client portal**: dedicated dashboard per client with goals tracking (live progress), action plan (click-to-cycle tasks), score breakdown, KPI cards — all with cinematic animations.
- **Lint**: clean. **Verification**: full flow tested via agent-browser (onboard → portal). Mobile-responsive.

Unresolved / Next-phase recommendations:
- Client portal currently reuses company dashboard tabs; could add a portal-specific deep-dive (keywords/backlinks) with client-friendly framing.
- Add client authentication (currently token-only; could add email/PIN gate).
- Add email notifications when goals are achieved or tasks become overdue.
- Add a client-side "request audit" / "contact SEO team" feature.
- Add PDF report export branded per client.
- Consider a cinematic "loading reveal" sequence when a portal first loads (staggered number reveals).
