# Architecture Decision Records (ADRs)

**Purpose:** Document *why* we made certain technical choices. AI Agents: update this when you make a major decision.

## Decision 1: Use Next.js for Frontend
- **Date:** 2024-XX-XX
- **Context:** We need a fast, SEO-friendly (optional), and easily deployable web app that feels like a native mobile app.
- **Decision:** Next.js provides excellent routing and API capabilities out of the box.
- **Consequences:** We can potentially handle some lightweight backend logic within Next.js API routes before needing a dedicated Express/Python backend.

## Decision 2: n8n for Workflows
- **Date:** 2024-XX-XX
- **Context:** We need to send emails, track deadlines, and update partner NPA statuses without cluttering the core app backend.
- **Decision:** Use n8n.
- **Consequences:** Visual workflow building allows non-technical team members to understand and tweak automation logic.

## Decision 3: Use Vite for Frontend
- **Date:** 2026-09-11
- **Context:** Starting fresh on the frontend after wiping previous codebase.
- **Decision:** Used Vite with React instead of Next.js for a simpler, faster Single Page Application PWA that integrates directly with Supabase.
- **Consequences:** We don't have built-in API routes like Next.js, so any complex AI logic in Phase 2 will either need edge functions (Supabase) or a separate backend.

## Decision 4: Tailwind CSS v4
- **Date:** 2026-09-11
- **Context:** Tailwind CSS styling.
- **Decision:** Configured using the new `@tailwindcss/postcss` plugin and defined theme variables directly in `index.css`.
