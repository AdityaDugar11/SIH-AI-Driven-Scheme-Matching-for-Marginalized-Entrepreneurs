# INSTRUCTIONS.md — For coding agents (Claude Code, Cursor, Antigravity, etc.)

Read `PRD.md` and `PHASES.md` before writing any code. Follow phases in order — do not skip ahead to the geo/locator module before the recommender and calculator are working and tested.

## Ground rules
1. **No fake real-time data pretending to be real.** The channel partner "risk score" is simulated — hardcode it in the static dataset with a `simulated: true` field. Never build a live "risk API" that just returns random numbers dressed up as an API call.
2. **No auth system.** No login, no signup, no session management. If a feature seems to need "the user's account," it's out of scope — cut it.
3. **No ML training.** The recommender is a deterministic rules engine (if/else or a small decision table), not a trained model. If asked to "make it AI," add an LLM call only for: (a) parsing free-text user input into structured fields, or (b) generating the plain-language explanation of why a scheme was recommended. Never use an LLM to *decide* eligibility — that must stay deterministic and auditable.
4. **Keep it a single deployable unit if possible.** Prefer one repo, one frontend, a thin backend (or serverless functions) — do not build microservices for a 2-day hackathon.
5. **Every commit should leave the app in a demoable state.** If you're mid-refactor when time runs out, you have nothing to show. Small, working increments over big-bang rewrites.
6. **Write the "we mocked X" disclosure into the UI itself** (a small info icon/tooltip near the partner risk score), not just into your pitch deck — judges dig into UIs.

## Tech stack (recommended, not mandatory)
- Frontend: React + Tailwind (fast to build, works well with Claude Code/Cursor scaffolding)
- Backend: Node/Express or Python/FastAPI — either is fine, pick whichever the team knows better; do not learn a new stack under deadline
- Data: static JSON/CSV files checked into the repo for schemes + channel partners. No database needed for a hackathon demo — a database adds setup risk for zero benefit at this scale.
- Maps: Leaflet + OpenStreetMap (free, no API key friction) or Google Maps JS API if a key is already available
- i18n: `react-i18next` or a simple JSON dictionary + language toggle — do not integrate a live translation API unless there's spare time in Phase 5
- Deployment: Vercel/Netlify for frontend, Render/Railway for backend if separate — pick whatever the team can deploy in <15 minutes

## File/module structure to scaffold
```
/data
  schemes.json          # scheme rules table from PRD.md section 6
  partners.json         # ~30-50 static partner records: name, type, lat/lng, contact, simulated_risk_score
/backend (or /api)
  recommend.*           # rules engine: inputs -> ranked scheme list + reasons
  calculator.*          # EMI math given scheme + amount + tenure
  locator.*             # haversine distance + filter by risk threshold
/frontend
  /components
    IntakeForm
    RecommendationResult
    EmiCalculator
    PartnerMap
    LanguageToggle
  /i18n
    en.json
    hi.json
/docs
  PRD.md, INSTRUCTIONS.md, PHASES.md (this set)
```

## Definition of done for each module
- **Recommender**: given a documented set of test inputs (see PHASES.md Phase 2), always returns the scheme(s) matching PRD section 6 rules, with a 1-2 sentence human-readable reason.
- **Calculator**: EMI formula correctly applies principal (90% of cost, capped by scheme max), rate, tenure, moratorium; shows amortization summary (not necessarily full schedule table — total interest + EMI amount is enough for demo).
- **Locator**: returns nearest N partners by distance, excludes/deprioritizes those below a configurable risk threshold, renders on map with markers + info popup.
- **i18n**: every user-facing string comes from the dictionary, not hardcoded, for at least English + Hindi.

## What to do if you're behind schedule
Cut in this order (last item cut first, i.e. protect the top of this list hardest):
1. Recommender + reason text (never cut)
2. EMI calculator (never cut)
3. Partner locator with map (cut the map, keep it as a list, if desperate)
4. Hindi translation (cut to English-only, mention as future work)
5. Any animation/polish/extra scheme types beyond the 3 core ones
