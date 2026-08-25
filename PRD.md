# PRD.md — AI-Driven Market Linkage & Smart Cataloging App for Marginalized Artisans

## 0. Reality Check (read this before building anything)
- Hackathon window: Sep 4–5. You have ~11 days including this one. That is not enough time to build 3 real AI systems from scratch. You will **integrate existing models/APIs**, not train your own, except maybe a trivial pricing heuristic.
- Judges do not care that you trained a model. They care that: (a) the demo works live, (b) the architecture is defensible when questioned, (c) the problem is actually solved for the stated user (low digital literacy, regional language, no tech skill).
- Cut scope aggressively. A flawless 3-feature demo beats a broken 6-feature demo every time.
- Pricing "ML algorithm based on market trends" — there is no public dataset of artisan handicraft transaction prices. Do not pretend you trained a regression model on real market data. Build an **LLM + rule-based estimator** (raw material cost input + category benchmark + margin logic) and call it what it is: an AI-assisted pricing assistant. If a judge asks "what data was this trained on," you need a true answer, not a made-up one.

## 1. Problem Statement (as given)
AI-Driven Market Linkage and Smart Cataloging mobile application for Marginalized Artisans. Full official text preserved separately in `PROBLEM_STATEMENT.md` if you want it — not duplicated here to keep this file lean.

## 2. Target User
- Artisan/weaver/micro-entrepreneur, low digital literacy, regional language speaker (assume Hindi + 1 more, e.g. Bhojpuri/Marathi/Bengali depending on team's regional focus — pick ONE for the demo, don't try to support 10 languages).
- Has a basic Android smartphone. Likely mid-range/low-end. No iPhone assumption needed — **Android-first**, cross-platform framing is fine but don't burn time on iOS testing.
- Not comfortable typing long text. Voice-first input is core, not a nice-to-have.

## 3. MVP Scope (what you ACTUALLY build for Sep 4-5)

### In scope — 3 core features, cut down to demo-able versions:

**F1. AI Image Enhancer & Studio**
- Camera/gallery upload → background removal → auto brightness/contrast correction → clean product photo output.
- Use an existing background-removal model/API (rembg self-hosted, or remove.bg API for a demo-safe fallback). Do NOT build your own segmentation model.
- "Format to e-commerce standards" = crop to square/standard aspect ratio + white/neutral background + consistent resolution. That's it. Don't over-scope this into a full photo studio.

**F2. Multilingual Auto-Cataloger**
- Artisan records a voice note in regional language describing the product.
- Pipeline: Speech-to-text (regional lang) → translate to English → LLM generates SEO-friendly product title + description in English AND Hindi.
- Use existing STT (Whisper API, or Google Cloud Speech-to-Text / Bhashini API if you want extra "government relevance" points — Bhashini is a govt of India initiative, mentioning it in the pitch is a strong move) + an LLM (Claude/GPT API) for description generation.

**F3. Dynamic Pricing Assistant (heuristic, not ML-trained)**
- Inputs: product category, raw material cost (artisan enters manually — this is honest and realistic), rough size/dimensions, image (for category detection via LLM vision).
- Logic: category benchmark price range (hardcode a lookup table for demo — e.g. scraped/researched reference prices for 8-10 handicraft categories) + material cost + margin % → suggested price range, not a single fake-precise number.
- Be upfront in the pitch: "future version integrates live GeM/marketplace price feeds via scheduled scraping — MVP uses curated benchmark data."

### Explicitly OUT of scope for the hackathon (say this out loud to your team now):
- Real B2B buyer matching / negotiation engine
- Actual integration with GeM (Government e-Marketplace) — you can show a mock "push to GeM" button, not real API integration (GeM doesn't hand out API access easily/quickly)
- Payment gateway, order management, logistics
- Training any custom ML model
- Supporting more than 1-2 regional languages in the live demo
- Offline mode (mention as future work only)

## 4. Success Criteria for the Demo
1. Live: artisan uploads a raw messy product photo → app returns clean e-commerce-ready image, in under ~10 seconds.
2. Live: artisan speaks a 15-20 second voice note in Hindi → app shows generated English + Hindi listing text.
3. Live: given the image + description + entered material cost → app suggests a price range with one line of reasoning.
4. App doesn't crash. Judges will try to break it — have a rehearsed happy-path device ready as backup.

## 5. Impact Story for Pitch (use their own language back at them)
- Year-round digital channel instead of dependency on periodic melas.
- Removes 3 concrete skill barriers: photography, copywriting, pricing.
- Tie to financial inclusion / income increase — but don't claim a % number you can't justify. Say "reduces time-to-listing from days to minutes" — that's a claim you can actually defend.
