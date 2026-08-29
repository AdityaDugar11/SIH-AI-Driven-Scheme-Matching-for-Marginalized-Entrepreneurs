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
  "recommended_scheme": "Micro Finance Scheme",
  "reason": "Your project cost is within the ₹1.40 Lakh limit and your income qualifies for concessional lending.",
  "alternates": ["Term Loan Scheme"],
  "eligible": true
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
