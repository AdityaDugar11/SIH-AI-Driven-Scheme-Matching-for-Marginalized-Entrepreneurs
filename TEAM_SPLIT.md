# TEAM_SPLIT.md — 4 Tech Members

Don't let 4 people work on the same repo undirected — you'll spend day 1-2 on merge conflicts instead of features. Split by module ownership, not by "everyone touches everything."

## Member A — Mobile App Lead
- Owns `/app` (Expo React Native).
- Phase 0: scaffold app, navigation, basic screens (empty states).
- Phase 2-4: build UI for image capture, voice recording, listing display, price display — as backend endpoints become available (coordinate with Member B daily).
- Phase 5: owns the full UI/UX polish pass.
- Tool: Claude Code or Cursor, primed with INSTRUCTIONS.md + PRD.md + TECH_STACK.md, told explicitly "you only work in /app, call backend endpoints as documented, do not touch /backend."

## Member B — Backend Lead
- Owns `/backend` (Node/Express) and Supabase schema.
- Phase 0-1: schema, auth, CRUD.
- Phase 2-4: build the API endpoints that the AI pipeline (rembg, STT, LLM, pricing) hooks into. This person defines the API contract Member A codes against — write it down in a shared doc (`API_CONTRACT.md`, one page, updated as you go) so Member A isn't blocked waiting for verbal updates.
- Coordinates directly with Member D on n8n webhook handoff (who calls whom, what payload shape).

## Member C — AI/ML Integration Lead
- Owns the rembg microservice (`/services/rembg`), Bhashini/Whisper integration, and the LLM prompt engineering for cataloging + pricing.
- This is the highest-risk module (external API approvals, prompt quality). Start Bhashini registration and rembg setup on Day 1, not after other phases are "ready" for it.
- Also owns writing/testing the actual LLM prompts — test them standalone (e.g. in a script or Postman) before wiring into the pipeline, so bugs are isolated to prompt quality vs integration bugs.

## Member D — n8n / Orchestration + DevOps
- Owns the n8n workflows (see `N8N_WORKFLOW_BUILD.md`), the ngrok/Cloudflare tunnel setup, and demo-day infra (device setup, network fallback, backup video recording).
- Also owns integration testing (Phase 6) — this person's job on Day 9 is to try to break the app, not to add features.
- Should sync with Member B early on webhook payload shapes so n8n workflows and backend agree on the contract from day 1, not day 6.

## Daily sync rule
15-minute stand-up every day: what's done, what's blocked, what changed in the API contract. Blocked-on-Bhashini-approval is the #1 risk — if it's not approved by Day 3, Member C switches to Whisper fallback immediately, don't wait and hope.

## Presentation team (2 members) — what they actually need from tech team
They don't need to understand the code. They need, by Phase 7 (Day 10):
1. A one-paragraph plain-English explanation of each of the 3 features (no jargon — "the app cleans up photos automatically" not "we use rembg for background segmentation").
2. Screenshots/screen recording of each feature working.
3. The honest answers to likely hard questions (see `PITCH_QA.md`).
4. The impact numbers/claims that are actually defensible (from PRD.md section 5) — tech team must flag if any planned feature got cut, so presentation doesn't pitch something that doesn't exist in the demo.
