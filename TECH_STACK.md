# TECH_STACK.md

## Principle
Every choice below optimizes for "buildable and demoable in 11 days by a student team," not "production-grade at scale." Don't let anyone on the team gold-plate this.

## Mobile App
- **React Native (Expo)** — cross-platform box ticked, fastest iteration, huge community, works with Claude Code / Antigravity / Cursor well since it's just JS/TS.
- Do NOT use Flutter unless someone on the team is already fluent in it. Learning a new framework mid-hackathon is how you lose.
- UI: Expo + NativeWind (Tailwind for RN) for fast, clean, minimalist styling. Use a component library (e.g. React Native Paper or Tamagui) so you don't hand-roll every button — you have 11 days, not 11 weeks.
- Voice recording: `expo-av`.
- Camera: `expo-camera` / `expo-image-picker`.

## Backend
- **Node.js + Express** (or Fastify) — keeps the whole stack in JS/TS, one language for AI agents to reason about, faster for Claude Code to scaffold consistently.
- **Supabase** (Postgres + Auth + Storage) — self-hosted or managed cloud, your call. Managed cloud free tier is faster to set up under time pressure; use that unless you have a strong reason to self-host.
  - Storage: product images (raw + enhanced).
  - DB: artisans, products, listings, price_suggestions tables.
  - Auth: simple phone-number OTP or even just a basic PIN for the demo — don't over-engineer auth for a hackathon judge.

## AI / ML Services (use APIs, don't train anything)
- **Background removal**: `rembg` (open-source, self-hostable via a small Python microservice) OR remove.bg API as a fallback if rembg quality/speed is a problem on demo day. Recommend standing up rembg as a tiny FastAPI microservice — free, no API key dependency risk during the live demo.
- **Speech-to-text (regional language)**: Bhashini API (Govt of India — strong pitch synergy) as primary; OpenAI Whisper API as a reliable fallback if Bhashini integration friction eats too much time.
- **Translation + description generation**: Claude API or GPT-4o API. One well-crafted prompt does translation + SEO description generation + bilingual output in a single call — don't build 3 separate calls when 1 structured prompt works.
- **Pricing assistant**: no external AI service needed — this is your own heuristic logic (Node function) possibly calling the LLM once for category classification from the image (vision-capable model) plus a hardcoded benchmark table.

## Orchestration — n8n (self-hosted, confirmed on your laptop)
See `N8N_WORKFLOWS.md` for the actual workflows. Use n8n where it saves you glue code, not everywhere:
- Good fit: the "process new product" pipeline (image → rembg → store; voice → STT → translate → LLM → store) as an async job, and a scheduled "refresh benchmark prices" workflow.
- Bad fit: don't route your core request/response mobile-app API calls through n8n webhooks if it adds latency you can't afford live on stage. Keep the synchronous, judge-facing calls direct from backend to AI service. Use n8n for the behind-the-scenes / batch / scheduled stuff.

## Dev Tooling / AI Coding Agents
- Recommend **Claude Code** as primary — give it `INSTRUCTIONS.md` + `PHASES.md` + `PRD.md` as context files at repo root, work phase by phase, commit after each phase.
- Antigravity / other agentic IDEs: same doc set works, they just read markdown context files the same way.
- Keep docs in repo root (`/docs` folder) so every agent session re-reads current state instead of hallucinating scope.

## Environment / Keys You Need to Set Up NOW (today, not day 9)
- Supabase project
- Anthropic or OpenAI API key
- Bhashini API access (register early — govt API access can take a few days to approve, this is your biggest schedule risk)
- remove.bg API key as rembg fallback (optional, free tier)
