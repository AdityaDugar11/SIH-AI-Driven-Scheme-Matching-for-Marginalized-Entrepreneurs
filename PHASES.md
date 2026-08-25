# PHASES.md — 11-Day Build Plan (Aug 24 → Sep 3, demo Sep 4-5)

Ground rule: if you're behind schedule by day 7, CUT a feature — don't try to catch up by working faster on all three. Cut the pricing assistant to pure hardcoded-lookup-only (no LLM category detection) first; it's the least impressive feature to judges anyway.

## Phase 0 — Setup (Day 1, Aug 24)
- Register for Bhashini API access immediately (approval lag risk).
- Create Supabase project, Anthropic/OpenAI API keys, GitHub repo.
- Scaffold Expo app + Node/Express backend skeleton.
- Confirm n8n instance running locally, reachable, and (if needed for live demo) tunnel-able via ngrok/cloudflared — test this NOW, not on demo day, since your laptop's self-hosted n8n won't be reachable from a judge's network otherwise.
- Deliverable: empty app runs on a physical Android device, backend responds to a health-check endpoint.

## Phase 1 — Core Data Model & Auth (Day 2)
- Supabase schema: `artisans`, `products`, `product_images`, `listings`, `price_suggestions`.
- Basic auth (phone/PIN — keep dead simple).
- Backend CRUD for products.
- Deliverable: can create an artisan profile and an empty product record from the app.

## Phase 2 — F1: Image Enhancer (Days 3-4)
- Stand up rembg microservice (Python/FastAPI), test locally.
- Backend endpoint: accepts image, calls rembg, applies crop/resize/lighting correction, stores raw + enhanced in Supabase Storage.
- Mobile: camera/gallery picker → upload → show before/after.
- n8n workflow (optional/parallel): async "process image" workflow if you want the pipeline decoupled from the request thread.
- Deliverable: working before/after image demo, <10s processing time.

## Phase 3 — F2: Multilingual Auto-Cataloger (Days 5-6)
- Mobile: voice recording UI (record, playback, re-record).
- Backend: upload audio → Bhashini STT (or Whisper fallback) → translated text → single LLM call producing structured JSON: `{title_en, description_en, title_hi, description_hi, tags[]}`.
- Mobile: display generated bilingual listing, allow manual edit before saving (important — always let the human correct AI output, especially for a low-trust-in-tech user).
- Deliverable: voice note in → bilingual listing out, editable.

## Phase 4 — F3: Pricing Assistant (Day 7)
- Hardcode benchmark price table for 8-10 categories (research real reference prices — don't invent numbers, judges may know actual mela prices).
- Backend: material cost + category (from LLM vision classification of the image, or manual dropdown if time is short) → suggested price range + 1-sentence rationale.
- Mobile: display suggested range on the listing screen.
- Deliverable: end-to-end flow — photo → enhanced image → voice → listing → price suggestion, all in one product creation flow.

## Phase 5 — Polish, UI/UX pass (Day 8)
- Apply consistent minimalist design system (large touch targets, icon-first navigation, minimal text, since target users may have low literacy — icons and voice prompts over dense text menus).
- Add a simple "marketplace preview" screen showing how the listing would look to a buyer — this visualizes impact for judges even without a real marketplace integration.
- Error states, loading states, offline-friendly messaging (even if true offline mode is out of scope, don't let the app die silently on a bad network at the venue).

## Phase 6 — Integration Testing & Demo Rehearsal (Day 9)
- Full run-through on the actual device you'll demo with, on venue-like network conditions if possible (mobile hotspot, not your home wifi).
- Prepare a backup: pre-recorded screen capture of the full flow in case live network fails. Judges respect "here's a backup video in case wifi fails," it looks professional, not lazy.
- Load-test lightly — make sure two team members hitting it simultaneously (judges poking at two devices) doesn't break state.

## Phase 7 — Pitch Deck & Story (Day 10)
- Deck should map 1:1 to PRD impact goals — don't invent new claims not backed by what you built.
- Rehearse the honest answer to "is this pricing model trained on real data?" — answer: "MVP uses researched benchmark data + material cost heuristics; the architecture is designed to swap in live GeM/marketplace price feeds via the n8n scheduled workflow once API access is available." That's a *good* answer. A fabricated "yes we trained an ML model" answer collapses under one follow-up question.

## Phase 8 — Buffer (Day 11, Sep 3)
- This day exists because Phase 2-4 will run over. It will. Budget for it now.
- Final device check, charge all demo devices, confirm ngrok/tunnel to your n8n instance is stable, sleep before the hackathon.

## Demo Day (Sep 4-5)
- One person drives the demo, one person is ready to talk architecture if judges dig in, one person watches for bugs live and can hot-fix or switch to backup video.
