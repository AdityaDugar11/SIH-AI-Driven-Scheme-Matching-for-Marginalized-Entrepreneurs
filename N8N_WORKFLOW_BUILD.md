# N8N_WORKFLOW_BUILD.md — Exact Node Spec + AI Builder Prompt

Give this whole file to Member D (n8n owner). Build Workflow 1 by hand using the node spec below — it's the higher-risk one, don't trust an AI builder to get the branching/error-handling right on the first try. Workflow 2 is simple enough to let the AI builder attempt first.

---

## WORKFLOW 1: "Process New Product Submission"

### Node-by-node build

**1. Webhook (Trigger node)**
- HTTP Method: POST
- Path: `/webhook/process-product`
- Response Mode: "Using Respond to Webhook node" (so you control the response separately from processing)
- Expected incoming JSON body:
```json
{ "product_id": "uuid", "image_url": "https://...", "audio_url": "https://..." }
```

**2. Respond to Webhook (immediately)**
- Return `{ "status": "processing", "product_id": "{{ $json.product_id }}" }` right away with HTTP 202.
- Why: don't make the calling backend wait for the whole pipeline; it should poll a status field instead. Place this node right after the Webhook trigger, branching in parallel to the rest.

**3. HTTP Request — Call rembg service**
- Method: POST
- URL: `http://localhost:8000/remove-background` (your rembg FastAPI microservice — adjust port)
- Body: `{ "image_url": "{{ $json.image_url }}" }`
- Response: expect `{ "enhanced_image_url": "..." }` or raw image bytes — decide with Member C which, and keep it consistent.
- **On Error:** set node's "Continue on Fail" and route to an Error branch (see Node 8).

**4. HTTP Request — Upload enhanced image to Supabase Storage**
- Method: POST
- URL: `https://<your-project>.supabase.co/storage/v1/object/product-images/{{ $json.product_id }}.jpg`
- Auth: Header Auth, `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` (store as n8n credential, never hardcode)
- Body: binary data from Node 3's output.

**5. HTTP Request — Speech-to-text**
- Method: POST
- URL: Bhashini STT endpoint (or Whisper API `https://api.openai.com/v1/audio/transcriptions` as fallback)
- Body: `audio_url` (or fetch audio binary first with an HTTP Request/download node if the STT API needs raw bytes, not a URL)
- Output: transcript text.

**6. HTTP Request — LLM cataloging call**
- Method: POST
- URL: `https://api.anthropic.com/v1/messages`
- Headers: `x-api-key`, `anthropic-version`, `content-type: application/json`
- Body:
```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 800,
  "messages": [
    {
      "role": "user",
      "content": "You are helping an artisan create an e-commerce listing. Here is a transcript of their voice description (translate if needed): \"{{ $json.transcript }}\". Return ONLY valid JSON with keys: title_en, description_en, title_hi, description_hi, tags (array of 5 strings), suggested_category. Description should be SEO-friendly, 40-60 words, professional but not overly embellished — stay accurate to what the artisan described."
    }
  ]
}
```
- Parse the response text as JSON in the next node (use a Code/Function node with try/catch, strip markdown fences if present).

**7. Postgres/Supabase node — Write results**
- Update `products` table: set `enhanced_image_url`, `title_en`, `description_en`, `title_hi`, `description_hi`, `tags`, `category`, `status = 'ready'`, `WHERE id = product_id`.

**8. Error branch (from any HTTP Request node with "Continue on Fail" triggered)**
- Postgres node: update `products.status = 'failed'`, `products.error_message = {{ $json.error }}`
- (Optional) Send a notification — Slack/Telegram node — to the team's dev channel so someone notices during rehearsal instead of finding out from a confused judge.

**9. (Optional) Callback/notify**
- If you want push-style update instead of polling: HTTP Request node back to your backend's `/internal/product-ready` endpoint, `{ product_id, status }`. Otherwise skip — mobile app just polls `GET /products/:id` every 2s until `status = 'ready'`.

### Connections summary
`Webhook → [Respond to Webhook]` (parallel branch, ends here)
`Webhook → rembg call → Supabase upload → STT call → LLM call → parse JSON → Postgres write`
Any failed HTTP node → Error branch → Postgres status update

---

## WORKFLOW 2: "Refresh Pricing Benchmark Data"

### Node-by-node build
1. **Manual Trigger** (or Schedule Trigger, run once before demo day — do not rely on live execution during the demo).
2. **Set node** — manually define your curated benchmark array (research real reference prices for ~8-10 categories: e.g. handwoven sarees, block-print textiles, terracotta pottery, bamboo craft, brass/metalwork, jute products, embroidery/zardozi, wooden handicrafts). This can just be a JSON array typed directly into the Set node — you do not need to scrape anything live for the MVP.
3. **Split In Batches / Item Lists node** — iterate the array.
4. **Postgres/Supabase node** — upsert each item into `price_benchmarks` table: `category, min_price, max_price, avg_price`.

That's it — 4 nodes, no external API calls needed unless you specifically want to attempt live scraping (not recommended given time constraints).

---

## AI Workflow Builder Prompt (paste into n8n's built-in AI Workflow Builder, or into an AI agent generating n8n JSON)

Use this to get a first draft, then manually fix it against the node spec above — treat the AI output as a starting scaffold, not final.

```
Build an n8n workflow named "Process New Product Submission" with this structure:

1. A Webhook trigger node (POST, path "/webhook/process-product") that receives JSON: product_id, image_url, audio_url.
2. Immediately respond to the webhook with a 202 status and JSON { status: "processing", product_id }.
3. In parallel, run this sequential pipeline:
   a. HTTP Request POST to http://localhost:8000/remove-background with body { image_url } — expects response { enhanced_image_url }.
   b. HTTP Request POST to upload the enhanced image to Supabase Storage at https://YOUR_PROJECT.supabase.co/storage/v1/object/product-images/{product_id}.jpg using a bearer token credential.
   c. HTTP Request POST to a speech-to-text API using audio_url, returning a transcript.
   d. HTTP Request POST to https://api.anthropic.com/v1/messages using model claude-sonnet-4-6, sending the transcript in a prompt asking for a JSON object with keys title_en, description_en, title_hi, description_hi, tags, suggested_category.
   e. A Code node that parses the LLM response text as JSON, stripping any markdown code fences.
   f. A Postgres node that updates a "products" table row (matched by product_id) setting the parsed fields and status = 'ready'.
4. Add error handling: every HTTP Request node should have "Continue on Fail" enabled, routing failures to a branch that updates the same products row with status = 'failed' and stores the error message.
Use n8n credentials (not hardcoded values) for all API keys and tokens.
```

---

## Testing checklist before demo day
- Trigger Workflow 1 manually with a test payload — confirm all 6 steps complete and the Supabase row updates correctly.
- Deliberately break one node (e.g. wrong URL) to confirm the error branch fires and doesn't leave the row stuck in "processing" forever — this is the failure mode most likely to embarrass you live.
- Time the full pipeline end-to-end 3 times, note average — this is the number Member A uses to build the "processing..." UI (spinner, progress copy) in the app.
