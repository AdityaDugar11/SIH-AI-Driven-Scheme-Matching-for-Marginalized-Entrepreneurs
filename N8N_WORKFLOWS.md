# N8N_WORKFLOWS.md — Self-Hosted n8n on Your Laptop

## Honest scoping note
n8n is genuinely useful here for 2 workflows. Don't force it into places where a direct backend function call is simpler and faster — extra hops through n8n add latency and another point of failure during a live demo. Use it for async/batch work, not the synchronous judge-facing request path if you can avoid it.

## Critical infra issue you must solve BEFORE demo day
Your n8n is self-hosted **on your laptop**. On demo day:
- If your backend also runs locally/on the same laptop and calls n8n via `localhost`, fine — no issue.
- If judges' network is different from where you developed, or if the backend is deployed elsewhere (e.g. Supabase edge functions, a cloud VM) and needs to reach your laptop's n8n, you need a stable tunnel: **ngrok** or **Cloudflare Tunnel**, set up and tested at least a day before, with the URL hardcoded/configured in your backend `.env`. Free ngrok URLs rotate on restart — either pay for a static domain or re-configure the env var right before the demo starts. Test this exact failure mode in Phase 6.
- Simplest safe option: run backend AND n8n on the same laptop, same local network, demo entirely from that laptop's hotspot. Removes the tunnel dependency entirely. Recommend this unless you have a specific reason not to.

## Workflow 1: "Process New Product Submission" (async pipeline)
**Trigger:** Webhook, called by backend when a new product image + voice note are uploaded.

**Steps:**
1. Webhook node receives `{ product_id, image_url, audio_url }`.
2. HTTP Request node → calls rembg microservice with `image_url` → gets back enhanced image.
3. Upload enhanced image to Supabase Storage (HTTP Request node with Supabase Storage API, or use n8n's Supabase node if available).
4. HTTP Request node → Bhashini/Whisper STT with `audio_url` → transcript text.
5. HTTP Request node → Claude/GPT API with structured prompt (transcript + product category context) → returns JSON `{title_en, description_en, title_hi, description_hi, tags}`.
6. HTTP Request/Postgres node → write results back to Supabase `products`/`listings` table, update `status = 'ready'`.
7. (Optional) Webhook/HTTP callback to notify backend/app that processing is done, so the app can poll or receive a push update instead of blocking the UI thread.

**Why async matters for the demo:** processing (image + STT + LLM) may take 5-15 seconds combined. Don't make the mobile app hang on a single blocking request — trigger this workflow, show a progress state in the app, poll a status endpoint every 2 seconds.

## Workflow 2: "Refresh Pricing Benchmark Data" (scheduled)
**Trigger:** Schedule node (e.g. once, run manually before demo day — don't rely on live scraping working during the actual demo).

**Steps:**
1. Schedule/manual trigger.
2. HTTP Request nodes to pull reference pricing (curated research sources — GeM public listings if accessible, or manually compiled data; be honest in the pitch that this is curated, not live-scraped in the MVP).
3. Transform/Set node to normalize into `{category, min_price, max_price, avg_price}`.
4. Postgres/Supabase node → upsert into a `price_benchmarks` table.

**This workflow's real value is narrative, not runtime function**: in your pitch, show this workflow diagram to prove the architecture supports "live" data refresh even though the MVP demo uses a table populated by this workflow run ahead of time, not live during the 5-minute demo slot.

## Export requirement
Before demo day, export both workflows as `.json` from n8n (Download button) and commit them to `/n8n-workflows/` in the repo. If your laptop crashes or n8n data resets, you can reimport in under a minute instead of rebuilding live.

## What NOT to build in n8n
- Do not put the pricing logic itself in n8n if it needs to respond in real time as the user types/adjusts material cost in the app — that's a direct backend function, not a workflow hop.
- Do not use n8n for auth or anything security-sensitive; keep that in your Express backend with proper handling.
