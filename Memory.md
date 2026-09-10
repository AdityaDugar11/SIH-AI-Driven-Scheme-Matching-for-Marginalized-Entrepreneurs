# Memory.md — AI agent persistent session memory

## Purpose
This file exists so an AI coding agent starting a NEW session/task does not have to re-read the entire repo, re-derive prior decisions, or ask questions that were already answered. **The agent must update this file at the end of every work session** (or after completing a meaningful chunk of work) so the next session — even a different agent/tool — can resume instantly.

Rule for agents: read this file FIRST, before PRD.md/INSTRUCTIONS.md/PHASES.md, at the start of any task. Only read the deeper files if Memory.md doesn't already answer what you need. Update this file LAST, after finishing work, before ending the session.

---

## Project facts (stable — rarely changes, don't re-derive)
- Project: AI-Driven Scheme Matching for Marginalized Entrepreneurs (SIH hackathon, Sept 4-5)
- Stack: React+Vite+Tailwind frontend, FastAPI/Express backend, static JSON data, n8n for automation, Google Sheets for Leads/Partners logs
- Core constraint: eligibility logic is deterministic rules, never ML — see Decisions.md D1
- No auth, no database, no native app — see Rules.md
- Full spec locations: PRD.md (scope), INSTRUCTIONS.md (build rules), PHASES.md (order), TECH_STACK.md (API contract), UI.md (screens), Design.md (visual tokens), Architecture.md (data flow)

---

## Current status (UPDATE THIS EVERY SESSION — overwrite, don't append forever)
**Last updated by**: Antigravity frontend build session on 2026-09-10T08:53+05:30
**Phase we're in** (per PHASES.md): Phase 1 COMPLETE + Phase 2 IN PROGRESS — Frontend Screens 1-3 built, wired to live backend

### Live backend (URL: `https://aidrivenschemematchingformarginalizedentrepren-afxeu5xhv.vercel.app`)
- **POST /api/recommend** — ✅ tested, working
- **POST /api/calculate-emi** — ✅ tested, working
- **POST /api/nearest-partners** — ✅ tested, working
- **GET /api/health** — ✅ tested, working

### Done (this session — frontend)
- Vite + React + Tailwind v4 scaffolded in `/frontend/` (separate from backend root)
- **Screen 1 (IntakeForm)**: income, loan purpose (radio), cost, city dropdown, "Find My Scheme" CTA → calls real backend `/api/recommend`
- **Screen 2 (RecommendationResult)**: eligible badge + scheme name + reason + alternates (green), or ineligible with amber styling (not red, per Design.md)
- **Screen 3 (EmiCalculator)**: loan/contribution split, native range slider (6-60 months), live EMI recalculation via real `/api/calculate-emi`, visual bar, secondary info
- **Shared components**: LanguageToggle (English/Hindi), CurrencyDisplay (₹ Indian locale), StepHeader (Step X of 5 + dots)
- **React Context** (`AppContext.jsx`): shared state for intake, recommendation, EMI, language — Screens 4-5 can read same state
- **API client** (`api/client.js`): swappable mock/real fetch wrapper via `VITE_USE_MOCK_API` env var. Currently set to `false` (real backend)
- **Mock fixtures** (`api/mocks.js`): offline dev fallback matching TECH_STACK.md response shapes exactly
- **i18n**: English + Hindi dictionaries for all Screen 1-3 strings, custom `useTranslation` hook
- **Design system** (`index.css`): all Design.md tokens (trust-blue primary, off-white bg, system font, 18px mobile base, 44px touch targets, 8px radius)
- **Routing**: React Router — `/` (Screen 1), `/result` (Screen 2), `/emi` (Screen 3), `/partners` + `/confirmation` (placeholders for Screens 4-5)
- Build passes with zero errors (`npx vite build` — 119ms, 252KB JS gzipped to 79KB)

### Done (prior session — backend)
- Supabase Postgres: `schemes` (3 rows) + `partners` (30 rows), RLS enabled, seeded
- Vercel serverless deployment with CORS, Supabase integration
- `scripts/test-endpoints.js` — 19 automated tests, all passing

### Not started
- Screen 4 (Partner Locator + Leaflet map) — to be built by another team member
- Screen 5 (Confirmation) — to be built by another team member
- n8n workflows (Phase 4): lead logging, email notifications
- Hindi translation pass review (strings present but need native review)
- Mobile responsiveness polish (Phase 5)

### Known bugs / issues
- `SUPABASE_URL` env var in Vercel has a typo (`ttps://` instead of `https://`) — backend code works around it by preferring `NEXT_PUBLIC_SUPABASE_URL`
- Browser automated testing unavailable (Playwright CDN issue) — manual testing via `npm run dev` recommended

---

## Do NOT redo these (already decided/built — re-reading Decisions.md wastes tokens if it's already summarized here)
- Data layer changed from static JSON to Supabase Postgres — see TECH_STACK.md "Deviations" section
- Backend hosting changed from Render/Railway to Vercel Serverless Functions
- Eligibility logic is deterministic rules engine (if/else + sort by max_amount), NOT ML — do not suggest replacing it
- API contract matches TECH_STACK.md exactly (request/response shapes unchanged), endpoint paths have /api/ prefix per Vercel convention
- Frontend uses native `<input type="range">` for tenure slider — no external library (see Decisions.md D7)
- i18n uses custom `useTranslation` hook, not `react-i18next` — simpler for 2 languages (see Decisions.md D8)
- Frontend `.env` has `VITE_USE_MOCK_API=false` pointing at real backend — mock layer kept as fallback

## Open questions / blockers (things that need a human decision, not an agent decision)
- None currently — Screens 4-5 can be built by another team member using the shared AppContext

---

## Instructions for agents on updating this file
- Overwrite the "Current status" section each time — it's a snapshot, not a log. Old status info belongs in git commit history, not here.
- Only add to "Do NOT redo these" when something was genuinely tried/decided, not speculative.
- Keep this file under ~1 page. If it's growing past that, move detail into Decisions.md (permanent rationale) and leave only a one-line pointer here.
