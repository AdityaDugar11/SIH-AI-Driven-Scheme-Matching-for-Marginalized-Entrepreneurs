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
**Last updated by**: Antigravity backend build session on 2026-09-09T20:23+05:30
**Phase we're in** (per PHASES.md): Phase 0 + Phase 1 COMPLETE ✅ — Backend live, tested, ready for frontend integration

### Live endpoints (production URL: `https://aidrivenschemematchingformarginaliz.vercel.app`)
- **POST /api/recommend** — deterministic rules engine, 10/10 Testing.md cases passing ✅
- **POST /api/calculate-emi** — standard EMI formula, 5/5 Testing.md cases passing ✅
- **POST /api/nearest-partners** — Haversine distance + risk deprioritization, 4/4 Testing.md cases passing ✅
- **GET /api/health** — health check for cold-start warming ✅

### Done
- Supabase Postgres: `schemes` (3 rows) + `partners` (30 rows), RLS enabled, seeded
- Migration + seed SQL in `supabase/` directory
- Static JSON data files: `data/schemes.json`, `data/partners.json`
- Vercel serverless deployment with CORS, Supabase integration connected
- Shared Supabase client (`api/_lib/supabase.js`) with multi-env-var fallback
- `scripts/test-endpoints.js` — 19 automated tests, all passing
- TECH_STACK.md updated with deviation flags (Supabase + Vercel)

### Not started
- Frontend (Phase 2): intake form, recommendation display, EMI calculator UI, partner map
- n8n workflows (Phase 4): lead logging, email notifications
- i18n (Phase 4): English + Hindi dictionaries
- Polish (Phase 5): edge case handling in UI, mobile responsiveness

### Known bugs / issues
- `SUPABASE_URL` env var in Vercel has a typo (`ttps://` instead of `https://`) — code works around it by preferring `NEXT_PUBLIC_SUPABASE_URL`. Fix the env var in Vercel Dashboard when convenient.

---

## Do NOT redo these (already decided/built — re-reading Decisions.md wastes tokens if it's already summarized here)
- Data layer changed from static JSON to Supabase Postgres — see TECH_STACK.md "Deviations" section
- Backend hosting changed from Render/Railway to Vercel Serverless Functions
- Eligibility logic is deterministic rules engine (if/else + sort by max_amount), NOT ML — do not suggest replacing it
- API contract matches TECH_STACK.md exactly (request/response shapes unchanged), endpoint paths have /api/ prefix per Vercel convention

## Open questions / blockers (things that need a human decision, not an agent decision)
- [e.g., "Which backend language — Node or Python — still needs the team to confirm based on who's free"]

---

## Instructions for agents on updating this file
- Overwrite the "Current status" section each time — it's a snapshot, not a log. Old status info belongs in git commit history, not here.
- Only add to "Do NOT redo these" when something was genuinely tried/decided, not speculative.
- Keep this file under ~1 page. If it's growing past that, move detail into Decisions.md (permanent rationale) and leave only a one-line pointer here.
