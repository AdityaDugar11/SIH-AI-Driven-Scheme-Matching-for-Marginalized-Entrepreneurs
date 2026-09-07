# Rules.md — Quick reference

One page, nothing new — every rule here is explained in more depth in another file (referenced). Read this when you need a fast yes/no answer mid-build; read the linked file when you need the reasoning.

## Absolute constraints
1. Eligibility logic = deterministic rules only, never ML/LLM-decided. *(PRD.md, AGENTS.md)*
2. No login/auth/user accounts. *(PRD.md non-goals)*
3. No real NPA/fund-utilization data — simulated + disclosed in UI. *(PRD.md §2, Design.md tooltip spec)*
4. No database — static JSON + Google Sheets only. *(TECH_STACK.md, Architecture.md)*
5. No microservices — one frontend, one backend, one n8n instance. *(TECH_STACK.md)*
6. No native mobile app — responsive web app only. *(TECH_STACK.md)*
7. Backend endpoints are stateless. *(Memory.md)*
8. n8n handles automation only, never eligibility/EMI computation. *(Architecture.md)*

## Build order (don't reorder)
Recommender + Calculator → Frontend core flow → Locator → n8n workflows → i18n → polish.
Full detail: `PHASES.md`.

## Cut list if behind schedule (cut top-down, protect the bottom)
1. Animations/visual polish
2. Hindi translation
3. Map visualization (fall back to list only)
4. n8n Workflow 2 (risk refresh) — Workflow 1 (lead notification) is higher priority
5. Never cut: recommender, calculator, core intake→result flow

## Disclosure requirements (non-negotiable for demo honesty)
- Partner risk score must show a "simulated" indicator in the UI itself, not just in the pitch deck. *(UI.md Screen 4)*
- Presentation team must state upfront what's real vs simulated before Q&A forces the admission. *(PITCH_QA.md)*

## Data sources of truth (don't let copies drift)
- Scheme rules: `data/schemes.json` — one copy, backend reads it directly.
- Partner list: exists in TWO places on purpose — `data/partners.json` (backend) and Google Sheets "Partners" (n8n) — keep them manually in sync before demo, see Decisions.md for why this isn't unified.

## Who owns what (team of 4 tech + 2 presentation)
- 2x frontend (UI.md, Design.md)
- 1x backend (TECH_STACK.md API contract, PRD.md §6 scheme rules)
- 1x n8n/automation (N8N_WORKFLOWS.md)
- 2x presentation (PITCH_QA.md) — no code access needed
