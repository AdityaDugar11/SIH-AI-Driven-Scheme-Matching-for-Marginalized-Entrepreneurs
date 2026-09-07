# AGENTS.md

This file is read automatically by some AI coding agents (Cursor, Codex-CLI, etc.) that look for a file with this exact name at repo root. Claude Code / Antigravity should be pointed at INSTRUCTIONS.md directly if they don't auto-discover this file — the content is intentionally the same core rules, kept short here for agents that only skim.

## Non-negotiable constraints
- Eligibility/recommendation logic MUST be deterministic (rules/decision table). Never replace with a trained ML model or an LLM making the yes/no eligibility call.
- No authentication, no user accounts, no session persistence across visits.
- No real-time NPA/fund-utilization data — that field is simulated and must be labeled `simulated: true` in data and disclosed in the UI (see Design.md tooltip spec).
- Single backend service, single frontend app. No microservices.
- Data layer is static JSON files (`data/schemes.json`, `data/partners.json`) committed to the repo. Do not introduce a database.

## Where to look first
- Full scope/rules: `PRD.md`
- Build order: `PHASES.md`
- Detailed build instructions: `INSTRUCTIONS.md`
- API contract: `TECH_STACK.md`
- Screen specs: `UI.md`
- Visual design tokens: `Design.md`
- Test cases: `Testing.md`

## Style/output expectations for generated code
- Comment any simulated/mocked data inline at the point it's defined, not just in docs.
- Prefer small, working increments per commit over large multi-file rewrites.
- Match existing file/module structure in `INSTRUCTIONS.md` — don't restructure the repo layout mid-build.
- When uncertain about a scheme rule number (interest rate, cap), use the values in `PRD.md` section 6 and do not invent different figures.

## What NOT to do even if asked in a follow-up prompt
- Do not add a login/signup flow.
- Do not swap the rules engine for a model "to make it smarter."
- Do not fetch live data from any external NPA/credit-bureau source — no such public API exists for this use case; don't hallucinate one.
