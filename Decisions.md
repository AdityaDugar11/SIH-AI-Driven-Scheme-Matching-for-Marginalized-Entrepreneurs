# Decisions.md — Architecture Decision Record

**This file exists specifically so an AI coding agent doesn't re-suggest an approach that was already considered and rejected.** Before proposing an alternative architecture, library, or pattern, check here first — if it's listed as an "alternative considered," it was already evaluated and rejected for a stated reason. Don't re-litigate it unless the human explicitly asks you to reconsider.

Format: Decision → Alternatives considered → Why this one → Trade-off accepted → Revisit if. Add new entries at the bottom, append-only — never edit or delete a past entry, even if a decision later changes (add a new entry noting the change instead, so the history of *why* stays intact).

---

### D1: Rules engine, not ML model, for eligibility
**Alternatives considered**: trained classifier on synthetic data, LLM-as-judge for eligibility.
**Decision**: deterministic rule table (PRD.md §6).
**Why**: no real training data exists; a black-box decision on loan eligibility is a trust liability, not a strength, for a financial product; deterministic logic is instantly auditable and testable (see Testing.md §1).
**Revisit if**: real historical application data becomes available AND a regulator/domain expert signs off on model-based eligibility — not something to reconsider mid-hackathon.

---

### D2: Static JSON + Google Sheets, not a real database
**Alternatives considered**: Postgres via Supabase, MongoDB Atlas, Firebase Firestore.
**Decision**: `data/*.json` for backend source of truth; separate Google Sheets for n8n's Leads/Partners.
**Why**: dataset is small (~50 records), no concurrent-write complexity, zero hosting/migration setup time, and Sheets integrates natively with n8n with no code.
**Trade-off accepted**: two copies of partner data (JSON + Sheet) that must be manually kept in sync before demo. This is a known inconsistency risk — acceptable for a 2-day build, would need unification (single API/DB both systems read from) in a production version.
**Revisit if**: this goes beyond hackathon stage — unify onto one data source, likely a real DB, before any further development.

---

### D3: Frontend calls n8n webhook directly, not proxied through backend
See Architecture.md for full reasoning.
**Trade-off accepted**: webhook URL exposed client-side. Acceptable for a demo; not acceptable for production (would allow anyone to spam the webhook).
**Revisit if**: this goes to production — add backend proxy + rate limiting before real users touch it.

---

### D4: No authentication
**Alternatives considered**: simple email-based magic link, OAuth via Google.
**Decision**: no accounts at all.
**Why**: the core user journey (get a recommendation) doesn't require identity; adding auth would consume build hours better spent on the actual scheme-matching logic.
**Revisit if**: a "save my results" or "track my application status" feature is ever added — that would require some identity layer.

---

### D5: Partner risk/NPA data is simulated, disclosed in UI and pitch
**Alternatives considered**: omit the risk-scoring feature entirely; fabricate it without disclosure.
**Decision**: include it, simulate it, disclose it everywhere (UI tooltip, pitch slide, Q&A prep).
**Why**: the problem statement explicitly asks for fund-utilization-aware routing; showing the *shape* of the feature with honest disclosure demonstrates understanding of the requirement without pretending to have data that doesn't exist. Omitting it entirely would under-address the problem statement; faking it silently would be dishonest and risky in Q&A.
**Revisit if**: never, for this hackathon — this is a permanent disclosure, not a temporary placeholder to quietly remove later.

---

### D6: Web app, not native mobile app
See TECH_STACK.md "why not other options."
**Revisit if**: post-hackathon productionization targets app-store distribution specifically — out of scope for now.

---

### D7 (template for team to add more):
**Alternatives considered**:
**Decision**:
**Why**:
**Trade-off accepted**:
**Revisit if**:
