# ARCHITECTURE.md

## System diagram (describe in words — draw this on a whiteboard/slide too)

```
[User Browser]
     |
     v
[React Frontend - Vercel: yojana-match.vercel.app]
     |  (REST calls, via VITE_API_BASE_URL)
     v
[Backend API - Vercel Serverless Functions: aidrivenschemematchingformarginaliz.vercel.app]
     |  reads/writes
     v
[Supabase Postgres: schemes table, partners table]
     |
     | (on completion, POST lead payload directly from frontend)
     v
[n8n Webhook - hosted separately, see hosting note below]
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
| Frontend | Rendering 5 screens (UI.md), collecting input, calling backend, calling n8n webhook, i18n | Any eligibility/EMI math itself — always calls backend. Never holds Supabase credentials. |
| Backend | `/recommend`, `/calculate-emi`, `/nearest-partners` — all deterministic logic, reading from Supabase Postgres | Sending emails, logging leads, touching Google Sheets — that's n8n's job |
| Supabase Postgres | Source of truth for scheme rules (`schemes` table) and partner locations/risk scores (`partners` table) — see Decisions.md D11 for why this replaced static JSON | Anything client-facing directly — only the backend talks to Supabase, never the frontend |
| n8n | Post-recommendation automation: logging, notifying, simulated risk refresh | Any eligibility decision — never make n8n compute EMI or scheme match |
| Google Sheets (Leads/Partners) | n8n's own working data for automation/logging — a separate copy from Supabase, kept manually consistent for the Partners list | Being the backend's data source — the backend never reads Google Sheets |

## n8n hosting note
n8n must run on a server that stays on independent of any team member's laptop, since judges may check the deployed app at any time, including when no laptop is open. Do not rely on `localhost` + a tunnel (ngrok/Cloudflare Tunnel) as the only path — a tunnel only forwards to a service that's already running on someone's machine, so if that machine is off, the tunnel has nothing to forward to. Host n8n itself on a free, always-on service (e.g., Render's free Docker web service tier) and point the frontend's webhook env var at that permanent URL.

## Request flow for one full user journey
1. User submits intake form → frontend POSTs to `{VITE_API_BASE_URL}/recommend`
2. Backend queries Supabase `schemes` table, returns scheme + reason → frontend renders Screen 2
3. User adjusts tenure → frontend POSTs to `/calculate-emi` (can be called multiple times as tenure slider moves)
4. Frontend POSTs to `/nearest-partners` with lat/lng → backend queries Supabase `partners` table → renders Screen 4 map + list
5. User clicks "Send My Details" → frontend POSTs full lead payload directly to the n8n Webhook URL (NOT through the backend — this is a direct frontend→n8n call, keeps backend simple)
6. n8n runs Workflow 1 (see N8N_WORKFLOWS.md), responds success → frontend shows Screen 5

## Why the frontend calls n8n directly instead of routing through the backend
Simpler failure isolation: if n8n's webhook is slow or down, it doesn't take the backend's `/recommend` and `/calculate-emi` endpoints down with it, since they're unrelated. It also means one less thing your backend developer needs to build (no webhook-relay code). Trade-off: the n8n Webhook URL is exposed in frontend code — acceptable for a hackathon demo, would need a backend-proxied call in production to avoid exposing the URL publicly.

## Environment variables — where each one lives
| Variable | Lives on | Never put it on |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Backend project only | Frontend project |
| `VITE_API_BASE_URL` | Frontend project | — |
| `VITE_USE_MOCK_API` | Frontend project | — |
| n8n webhook URL (e.g. `VITE_N8N_WEBHOOK_URL`) | Frontend project, once n8n is hosted on a permanent URL | — |

## Failure modes to plan for (and what to do live if they happen)
- n8n webhook times out during demo → have Screen 5 gracefully show "Details saved locally, notification pending" rather than an error page. Don't let the whole demo hang on network flakiness.
- Backend cold-start delay (Vercel serverless cold start, or n8n's host sleeping on a free tier) → hit the health endpoint / n8n URL a few times right before your demo slot to warm it up.
- Google Sheets OAuth token expiring — re-authorize the credential in n8n if any workflow suddenly fails; don't assume it's a code bug first.
- Frontend showing `API error: 404` with near-instant timing (check DevTools Network tab) almost always means a missing/wrong `VITE_API_BASE_URL`, not a backend problem — check env vars before debugging backend code.