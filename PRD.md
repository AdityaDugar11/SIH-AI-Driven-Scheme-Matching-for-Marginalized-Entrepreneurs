# PRD — AI-Driven Scheme Matching for Marginalized Entrepreneurs
**SIH Problem Statement Track | 36-hour build**

## 1. Problem (as given)
SC-category citizens (income ≤ ₹5L/yr) are eligible for concessional loans (Micro Finance ≤₹1.4L, Term Loan ≤₹50L, Education Loan) routed through 100+ Channel Partners (SCA/PSB/RRB/NBFC-MFI). Citizens don't know which scheme fits them or which partner to approach. Result: misrouted applications, delayed disbursement.

## 2. Reality check (read this before building anything)
This section exists so the team doesn't waste hours chasing something unbuildable in 2 days.

| Component | Real or Mocked in this build | Why |
|---|---|---|
| Scheme eligibility logic | **Real** | Deterministic rules from income/cost/purpose — fully buildable, no external data needed |
| EMI / financial calculator | **Real** | Pure math, no external dependency |
| Channel partner directory (names, type, location) | **Real (static dataset we curate)** | We hand-build a JSON/CSV of ~30–50 real or realistic partner branches (enough for demo), not scraped live from 100+ orgs |
| Geo-distance / nearest partner | **Real** | Haversine distance or Maps API against our static dataset |
| Partner NPA / overdue / fund utilization status | **MOCKED, and we say so on stage** | No public API exposes this. We simulate a "risk score" field per partner in our static dataset and clearly label it "simulated — production version would pull from NBCFDC/SCA MIS" |
| Multi-lingual UI | **Real, scoped** | i18n on 2–3 languages (English + Hindi minimum) using a translation library, not a chatbot |
| "AI" scheme recommender | **Rule engine, optionally +NLP chat layer if time allows** | Core logic is a decision tree. If time permits, add a thin LLM layer on top for conversational input parsing. Do not build an ML classifier — no training data exists and it adds risk for zero benefit |

**Do not present mocked data as live in the demo without disclosing it.** State it upfront in one slide: "Partner risk/NPA data is simulated for demo; production integration point identified."

## 3. MVP scope (what must work end-to-end by demo time)
One critical path, fully working:
1. User answers a short form (income, project type, cost estimate, education need, location).
2. System recommends 1 best-fit scheme + 1–2 alternates, with plain-language explanation of *why*.
3. User sees EMI table (principal, tenure, interest rate per scheme rules, moratorium).
4. User sees nearest 3 eligible channel partners on a map, sorted by distance + simulated risk score, with contact info.
5. UI available in English + Hindi toggle.

Everything else (accounts, application submission, admin dashboard, real chatbot, SMS notifications) is a "future scope" slide, not a build target.

## 4. Explicit non-goals (do not build these — team will burn time otherwise)
- No user authentication/login system — not needed for demo, adds hours for zero judging value.
- No real backend integration with any bank/NBFC/government system.
- No actual loan application submission workflow — this is a *recommender*, not a transaction system.
- No ML model training. No dataset scraping of real citizens or real bank NPA figures.
- No native mobile app — a responsive web app is sufficient and far faster to build/demo.

## 5. Users
- Primary: SC-category individual or family seeking a loan for a small business or education, low financial literacy, may not know English well.
- Secondary (for future scope, not this build): channel partner staff verifying incoming leads.

## 6. Scheme rules (source of truth for the engine)
Use these as your initial rule table — verify against actual NBCFDC/NSFDC scheme documents if time allows, but for hackathon purposes this structure is sufficient:

| Scheme | Eligibility | Max Amount | Interest Rate | Moratorium |
|---|---|---|---|---|
| Micro Finance Scheme | Income ≤ ₹5L, small project/micro-enterprise | ≤ ₹1.40 Lakh | ~6.5%–8% | 3–6 months |
| Term Loan Scheme | Income ≤ ₹5L, larger project (manufacturing/trade/service) | ≤ ₹50.00 Lakh | ~8%–10% (scale with amount) | 6–12 months |
| Education Loan Scheme | Income ≤ ₹5L, admission to recognized course (India/abroad) | Course-cost dependent, typically higher cap | ~6.5%–8% (lower for girls in some schemes) | Course duration + 6–12 months |

Loan covers up to 90% of project/course cost — remaining 10% is applicant contribution; the calculator must reflect this, not just show full project cost as loan amount.

## 7. Success metrics for the demo
- Time from form submission to recommendation: <2 seconds (rule engine, no excuse for latency).
- Recommendation correctness against the rule table: 100% on test cases (this is graded by common sense, verify manually).
- Judges should be able to complete the full flow themselves in under 90 seconds without your help.

## 8. Risks
- Team over-scoping the geo/NPA module and running out of time for the core recommender — mitigate by building recommender + calculator FIRST (see PHASES.md), locator last.
- Presenting mocked NPA data as real — will look dishonest in Q&A if a judge asks "where does this come from." Have the honest answer ready.
