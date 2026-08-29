# PHASES.md — 2-Day Build Plan (Sept 4–5)

Assume ~30 working hours total across the team once you subtract sleep/food/travel. Times below are guidance, not gospel — adjust to your actual start time, but keep the ORDER.

## Phase 0 — Setup (60–90 min, before/at hackathon start)
- Repo scaffolded, tech stack installed, deployment pipeline tested with a "hello world" (deploy early so you know it works before you're panicking at hour 30).
- `data/schemes.json` and `data/partners.json` created with placeholder structure (even 5 dummy partners is enough to unblock frontend work).
- Team roles assigned: who owns recommender/calculator logic, who owns frontend/UI, who owns locator/map, who owns pitch deck.

## Phase 1 — Core recommender + calculator logic (Day 1, hours 1–6)
- Implement rules engine per PRD section 6.
- Write test cases first (a plain list is fine, doesn't need a formal test framework given time constraints):
  - Income ₹4L, project cost ₹1L, small business → Micro Finance
  - Income ₹3L, project cost ₹20L, manufacturing → Term Loan
  - Income ₹2L, admission to engineering course, cost ₹8L → Education Loan
  - Edge case: income ₹6L (over threshold) → not eligible, show why
  - Edge case: cost ₹1.4L exactly on Micro Finance boundary → confirm boundary logic
- Implement EMI calculator: standard EMI formula, apply moratorium (interest-only or deferred, pick one and document it), cap loan at min(90% of cost, scheme max).
- **Checkpoint: by end of Phase 1, you should be able to run inputs through recommender+calculator via a script or basic API call and get correct numbers — before any UI exists.**

## Phase 2 — Frontend intake + results (Day 1, hours 6–12)
- Build intake form (income, project type/education, cost, location — location can be manual lat/lng or a city dropdown for demo simplicity, real geolocation is a nice-to-have not a requirement).
- Wire form to recommender/calculator; display results (scheme name, why, EMI breakdown).
- Basic styling — clean and readable beats "impressive" given the time budget. Judges reward clarity for this kind of civic/financial-literacy tool.
- **Checkpoint: end-to-end flow works, ugly is fine, broken is not.**

## Phase 3 — Partner dataset + locator (Day 1 evening → Day 2 morning, hours 12–18)
- Finalize `partners.json` with ~30–50 entries (mix of real known SCA/PSB/RRB/NBFC-MFI names + branch cities is fine — you're not claiming to have scraped live registry data, just providing a representative dataset; disclose this).
- Add `simulated_risk_score` field (0–100) with a short comment in the data file explaining it's simulated.
- Implement haversine distance + filter/sort by distance and risk threshold.
- Integrate map component, markers, popups with partner info + "why this partner" (distance + risk score + scheme match).
- **Checkpoint: given a demo location, correct nearest partners appear on map with a visible "simulated data" indicator.**

## Phase 4 — i18n (Day 2, hours 18–22)
- Extract all UI strings into `en.json` / `hi.json`.
- Add language toggle in header.
- Do NOT attempt more than 2 languages unless everything else is done early.

## Phase 5 — Polish, edge cases, deploy, rehearse (Day 2, hours 22–28)
- Handle bad/missing inputs gracefully (no crashes on empty form, non-numeric income, etc.)
- Deploy final build, test on a phone browser (judges often check mobile responsiveness).
- Prepare 1 slide explicitly disclosing what's real vs simulated (see PRD section 2) — this preempts the toughest Q&A question instead of getting caught off guard.
- Full run-through of the demo script at least twice, timed.

## Phase 6 — Pitch prep (last 2–4 hours)
- 3-minute demo script: problem (30s) → live demo of the one critical path (90s) → impact + what's real vs mocked + future scope (60s).
- Anticipate questions:
  - "How do you get real NPA data?" → Answer: production version integrates with NBCFDC/SCA MIS APIs; for demo we simulated it and disclosed that.
  - "Is this really AI?" → Answer: core eligibility logic is deterministic/auditable by design (financial eligibility should NOT be a black-box model); AI/NLP layer is used for [explanation generation / language input], not for the eligibility decision itself. This is a *feature*, not a limitation — auditability matters for financial products.
  - "What about fraud/false income claims?" → Answer: out of scope for this recommender; assumed to be verified by the channel partner during actual application, same as today.

## Non-negotiable checkpoints (if you miss these, re-scope immediately)
- End of Day 1: recommender + calculator + basic UI must work.
- Midday Day 2: locator must work, even without map polish.
- 4 hours before submission: feature-freeze. Only bug fixes and pitch prep after this point.
