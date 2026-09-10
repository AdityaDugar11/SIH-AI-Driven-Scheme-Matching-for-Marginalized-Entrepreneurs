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

### D7: Native range slider for tenure, no external library
**Alternatives considered**: `rc-slider`, `react-slider`, `@mui/material Slider`.
**Decision**: native `<input type="range">` styled with CSS.
**Why**: the EMI calculator has one slider (tenure, 6-60 months, step 6). Adding a library for one slider adds bundle size, API surface, and a dependency to track — all for a control that HTML provides natively. CSS styling of the native range input covers the Design.md aesthetic requirements (22px thumb, primary-blue color, rounded track).
**Trade-off accepted**: slightly less visual polish than a custom component; cross-browser styling requires vendor-prefixed pseudo-elements (`::-webkit-slider-thumb`, `::-moz-range-thumb`), both handled in `index.css`.
**Revisit if**: more complex slider interactions are needed (e.g., dual-handle range, tick marks with labels) — unlikely for this scope.

---

### D8: Custom useTranslation hook, not react-i18next
**Alternatives considered**: `react-i18next`, `i18next`, `react-intl`.
**Decision**: custom `useTranslation` hook (~30 lines) with JSON dictionaries (`i18n/en.json`, `i18n/hi.json`).
**Why**: the app supports exactly 2 languages (English + Hindi per PRD scope). `react-i18next` adds ~40KB to the bundle, requires initialization config, and supports features (namespaces, lazy loading, plurals, interpolation contexts) that aren't needed here. A plain JSON lookup with `{{variable}}` interpolation covers all current strings.
**Trade-off accepted**: if a 3rd+ language is added, the custom hook would need minor extension (add the JSON file + import). Still simpler than a full i18n framework for ≤3 languages.
**Revisit if**: language count exceeds 3, or complex pluralization rules are needed — then `react-i18next` earns its weight.

---

### D9: Fetch-wrapper mock/real toggle pattern, not MSW
**Alternatives considered**: MSW (Mock Service Worker), `json-server`, `miragejs`.
**Decision**: simple fetch wrapper (`api/client.js`) with `VITE_USE_MOCK_API` env flag. When `true`, returns fixtures from `api/mocks.js` after 300ms simulated delay. When `false`, calls real backend.
**Why**: MSW requires a service worker registration, a `public/mockServiceWorker.js` file, and browser-specific setup that adds complexity for a 2-day hackathon. The fetch-wrapper approach is ~70 lines, zero dependencies, one env var to toggle, and keeps mock data in a single importable file.
**Trade-off accepted**: mock layer doesn't intercept at the network level (no DevTools Network tab visibility for mocks). Acceptable — the mock layer is a development fallback, not a testing framework.
**Revisit if**: the project needs comprehensive API mocking for integration tests — then MSW would be worth the setup cost.

---

### D10: React-Leaflet for Partner Locator Map
**Alternatives considered**: Google Maps API, Mapbox GL JS.
**Decision**: `react-leaflet` with OpenStreetMap tiles.
**Why**: completely free, no API keys required, no billing setup needed for the hackathon. It perfectly matches the requirement of plotting a few points without incurring complex dependencies or usage limits.
**Trade-off accepted**: slightly less polished default tiles compared to Google Maps, but perfectly adequate for demo purposes.
**Revisit if**: real-time traffic or highly customized routing is needed, which OpenStreetMap/Leaflet might not natively provide out-of-the-box as cleanly as Google.

---

### D11: Deviation - Backend uses Supabase instead of JSON
**Alternatives considered**: `data/*.json` as planned in Architecture.md and original TECH_STACK.md.
**Decision**: The backend team implemented Supabase Postgres for the dataset instead of sticking to static JSON files.
**Why**: Team decided structured queries + seeded DB is cleaner for 3-endpoint backend.
**Trade-off accepted**: Violates the "No database" rule in `AGENTS.md` and `Architecture.md` but was decided by the backend team to improve the API implementation.
**Revisit if**: We need to strictly comply with `AGENTS.md` rules, which explicitly state "Do not introduce a database."
