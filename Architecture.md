# ARCHITECTURE.md

## System diagram (describe in words — draw this on a whiteboard/slide too)

```
[User Browser]
     |
     v
[React Frontend - Vercel]
     |  (REST calls)
     v
[Backend API - FastAPI/Express - Render/Railway]
     |  reads
     v
[data/schemes.json]  [data/partners.json]
     |
     | (on completion, POST lead payload)
     v
[n8n Webhook - Cloud]
     |
     +--> [Google Sheets: Leads]  (append)
     +--> [Gmail: applicant confirmation]
     +--> [Gmail: partner notification]

Separately, manually/scheduled triggered:
[n8n Manual/Schedule Trigger]
     |
     v
[Google Sheets: Partners] --read--> [Code node: simulate risk score] --write--> [Google Sheets: Partners]
```

## Component responsibilities
| Component | Responsible for | Does NOT do |
|---|---|---|
| Frontend | Rendering 5 screens (UI.md), collecting input, calling backend, calling n8n webhook, i18n | Any eligibility/EMI math itself — always calls backend |
| Backend | `/recommend`, `/calculate-emi`, `/nearest-partners` — all deterministic logic | Sending emails, logging leads, touching Google Sheets — that's n8n's job |
| n8n | Post-recommendation automation: logging, notifying, simulated risk refresh | Any eligibility decision — never make n8n compute EMI or scheme match |
| Static JSON data files | Source of truth for backend's scheme rules + partner locations | Live sync with Google Sheets — these are two separate copies, kept manually consistent (see Decisions.md for why) |

## Request flow for one full user journey
1. User submits intake form → frontend POSTs to `/recommend`
2. Backend returns scheme + reason → frontend renders Screen 2
3. User adjusts tenure → frontend POSTs to `/calculate-emi` (can be called multiple times as tenure slider moves)
4. Frontend POSTs to `/nearest-partners` with lat/lng → renders Screen 4 map + list
5. User clicks "Send My Details" → frontend POSTs full lead payload directly to n8n Webhook URL (NOT through the backend — this is a direct frontend→n8n call, keeps backend simple)
6. n8n runs Workflow 1 (see N8N_WORKFLOWS.md), responds success → frontend shows Screen 5

## Why the frontend calls n8n directly instead of routing through the backend
Simpler failure isolation: if n8n's webhook is slow or down, it doesn't take the backend's `/recommend` and `/calculate-emi` endpoints down with it, since they're unrelated. It also means one less thing your backend developer needs to build (no webhook-relay code). Trade-off: the n8n Webhook URL is exposed in frontend code — acceptable for a hackathon demo, would need a backend-proxied call in production to avoid exposing the URL publicly.

## Failure modes to plan for (and what to do live if they happen)
- n8n webhook times out during demo → have Screen 5 gracefully show "Details saved locally, notification pending" rather than an error page. Don't let the whole demo hang on network flakiness.
- Backend cold-start delay (Render free tier sleeps) → hit the health endpoint a few times right before your demo slot.
- Google Sheets OAuth token expiring mid-hackathon → re-authorize the credential in n8n if any workflow suddenly fails; don't assume it's a code bug first.
