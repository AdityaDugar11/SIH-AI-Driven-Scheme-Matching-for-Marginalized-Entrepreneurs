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
**Last updated by**: [agent/session name] on [date/time]
**Phase we're in** (per PHASES.md): [e.g., "Phase 2 — frontend intake+results"]

### Done
- [list completed, working pieces — be specific: "recommender endpoint returns correct results for test cases 1-8 in Testing.md" not just "backend done"]

### In progress
- [what's half-built, and exactly where it was left off]

### Not started
- [remaining scope from PHASES.md]

### Known bugs / issues
- [anything broken, with enough detail that the next session doesn't have to rediscover it]

---

## Do NOT redo these (already decided/built — re-reading Decisions.md wastes tokens if it's already summarized here)
- [Short bullet pointers to settled decisions, e.g., "Data layer is static JSON, not a DB — do not suggest adding one, see Decisions.md D2"]
- [Any dead-end approach already tried and abandoned, so it isn't tried again — e.g., "Tried geolocation API for Screen 1 location field, dropped it for a city dropdown due to permission-prompt unreliability in testing"]

## Open questions / blockers (things that need a human decision, not an agent decision)
- [e.g., "Which backend language — Node or Python — still needs the team to confirm based on who's free"]

---

## Instructions for agents on updating this file
- Overwrite the "Current status" section each time — it's a snapshot, not a log. Old status info belongs in git commit history, not here.
- Only add to "Do NOT redo these" when something was genuinely tried/decided, not speculative.
- Keep this file under ~1 page. If it's growing past that, move detail into Decisions.md (permanent rationale) and leave only a one-line pointer here.
