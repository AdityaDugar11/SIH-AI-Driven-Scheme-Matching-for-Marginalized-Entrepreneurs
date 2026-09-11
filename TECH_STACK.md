# TECH_STACK.md

## Final stack
| Layer | Choice | Setup notes |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | `npm create vite@latest` with react template, add Tailwind per its own Vite guide |
| Backend | FastAPI (Python) **or** Express (Node) — pick ONE based on team strength, do not mix | expose 3 endpoints: `/recommend`, `/calculate-emi`, `/nearest-partners` |
| Data store | Google Sheets (via n8n) for Leads + Partners; static JSON files (`schemes.json`, `partners.json`) checked into the repo as the backend's own source of truth | keep backend's `partners.json` and n8n's "Partners" Sheet in sync manually before demo — do not try to make the backend read live from Sheets, that's an extra integration you don't need |
| Maps | Leaflet.js + OpenStreetMap tiles | no API key needed, `react-leaflet` package for React |
| i18n | `react-i18next` or a plain JSON dictionary + context toggle | English + Hindi only |
| Automation | n8n (cloud, n8n.io free tier) | see N8N_WORKFLOWS.md |
| Hosting — frontend | Vercel | connect GitHub repo, auto-deploy on push |
| Hosting — backend | Render or Railway | free tier, watch for cold-start delay before demo (hit the URL a few times beforehand to warm it up) |
| Version control | GitHub, one shared repo | branch per person, merge to `main` frequently — do not let 4 people work unmerged for 12+ hours |

## ⚠️ Deviations from original plan (read before integrating)

> **Updated 2026-09-09** by backend build session. Two changes from the original spec:

| Original plan | What changed | Why | Impact on frontend |
|---|---|---|---|
| Data store: static JSON files | **Supabase Postgres** (tables: `schemes`, `partners`) | Team decided structured queries + seeded DB is cleaner for 3-endpoint backend | **None** — API request/response shapes are identical to the contract below |
| Backend hosting: Render/Railway | **Vercel Serverless Functions** (Node.js) | Same platform as frontend, no cold-start issues, simpler CI/CD | Endpoint paths are `/api/recommend`, `/api/calculate-emi`, `/api/nearest-partners` (Vercel `/api/` prefix convention) |

**What did NOT change:** API contract (request/response JSON shapes), eligibility logic (still deterministic rules, no ML), data schema, or CORS setup. Frontend can integrate against the same contract below without modifications.

**Environment variables required in Vercel Dashboard → Settings → Environment Variables:**
- `SUPABASE_URL` — the Supabase project URL
- `SUPABASE_ANON_KEY` — the Supabase publishable/anon key

---

## Why not other options (so nobody re-litigates this at hour 10)
- **No database (Postgres/Mongo/etc.)**: adds hosting, migrations, and connection-string debugging for a dataset of ~50 records that fits fine in a JSON file. Not worth it at this scale/timeframe.
- **No native mobile app**: a responsive web app covers the "digital platform or mobile application" requirement in the problem statement and is far faster to build and to demo (no app store, no device pairing).
- **No custom-trained ML model**: see PRD.md — eligibility must be deterministic and auditable, not a black box, and there's no training data available anyway.
- **No self-hosted n8n**: cloud free tier removes a server you'd otherwise have to babysit during the exact hours you should be coding the app.
- **No microservices**: one backend service, one frontend, done. Splitting further is organizational overhead your team size doesn't need.

## Environment setup checklist (do this first, hour 0-1)
- [ ] GitHub repo created, all 4 tech members added as collaborators
- [ ] Vite + React + Tailwind scaffolded, pushed to repo
- [ ] Backend skeleton (FastAPI or Express) scaffolded, pushed to repo
- [ ] Vercel connected to repo (frontend auto-deploy tested with placeholder page)
- [ ] Render/Railway connected to repo (backend auto-deploy tested with a `/health` endpoint)
- [ ] n8n cloud account created, Google Sheets + Gmail OAuth credentials authorized
- [ ] Two Google Sheets created: "Leads" (headers only), "Partners" (pre-filled, matches `partners.json`)
- [ ] `schemes.json` and `partners.json` committed to repo with at least placeholder data

## API contract (backend endpoints — lock this early so frontend/backend don't block each other)

### `POST /recommend`
Request:
```json
{ "income": 400000, "project_type": "small_business", "project_cost": 120000, "education_need": false }
```
Response:
```json
{
  "matches": [
    {
      "scheme": "Micro Finance Scheme",
      "match_score": 100,
      "eligible": true,
      "reason": "Your project cost (₹1,20,000) is within the ₹1.40 Lakh limit and your income qualifies for concessional lending under the Micro Finance Scheme.",
      "required_documents": ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Project Proposal", "Bank Passbook"]
    },
    {
      "scheme": "Term Loan Scheme",
      "match_score": 67,
      "eligible": false,
      "reason": "Your project cost (₹1,20,000) exceeds the maximum allowed for this scheme.",
      "required_documents": ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Detailed Project Report", "Bank Passbook"]
    }
  ]
}
```

### `POST /save-recommendation`
Request:
```json
{
  "email": "test@example.com",
  "scheme_name": "Micro Finance Scheme",
  "match_score": 100,
  "eligible": true,
  "reason": "Meets criteria",
  "state": "Delhi",
  "city": "New Delhi",
  "deadline_date": "2026-10-01"
}
```
Response:
```json
{
  "success": true,
  "saved_recommendation": {
    "id": "uuid",
    "email": "test@example.com",
    "scheme_name": "Micro Finance Scheme",
    "match_score": 100,
    "eligible": true,
    "reason": "Meets criteria",
    "state": "Delhi",
    "city": "New Delhi",
    "interested": null,
    "deadline_date": "2026-10-01",
    "reminder_sent": false,
    "created_at": "2026-09-11T12:00:00Z"
  }
}
```

### `GET /dashboard`
Request (Query Params):
```
?email=test@example.com
```
Response:
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "email": "test@example.com",
      "scheme_name": "Micro Finance Scheme",
      "match_score": 100,
      "eligible": true,
      "reason": "Meets criteria",
      "state": "Delhi",
      "city": "New Delhi",
      "interested": null,
      "deadline_date": "2026-10-01",
      "reminder_sent": false,
      "created_at": "2026-09-11T12:00:00Z"
    }
  ]
}
```

### `PATCH /interest`
Request:
```json
{
  "id": "uuid",
  "interested": true
}
```
Response:
```json
{
  "success": true,
  "updated_recommendation": {
    "id": "uuid",
    "interested": true
    // ... other fields
  }
}
```

### `POST /calculate-emi`
Request:
```json
{ "scheme": "Micro Finance Scheme", "project_cost": 120000, "tenure_months": 36 }
```
Response:
```json
{ "loan_amount": 108000, "applicant_contribution": 12000, "interest_rate": 7.0, "emi": 3340, "moratorium_months": 3, "total_interest": 12240 }
```

### `POST /nearest-partners`
Request:
```json
{ "lat": 28.61, "lng": 77.21, "scheme": "Micro Finance Scheme", "limit": 3 }
```
Response:
```json
{
  "partners": [
    { "id": "P014", "name": "XYZ RRB Branch", "type": "RRB", "distance_km": 3.2, "risk_score": 22, "simulated": true, "contact_email": "branch@xyzrrb.in" }
  ]
}
```

Also POST the same lead payload (name, phone, email, income, scheme_recommended, project_cost, emi, nearest_partner_id/name/email) to the n8n Webhook URL from the frontend once a user completes the flow — this triggers Workflow 1 from N8N_WORKFLOWS.md.
