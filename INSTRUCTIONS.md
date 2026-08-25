# INSTRUCTIONS.md — For AI Coding Agents (Claude Code / Antigravity / Cursor)

Read `PRD.md` and `PHASES.md` in this same folder before writing any code. Do not re-scope the project — the scope has already been deliberately cut for an 11-day hackathon timeline. If you think a feature should be bigger, don't — flag it in a comment instead and move on.

## Working rules
1. **Work one phase at a time**, in the order defined in `PHASES.md`. Do not jump ahead to Phase 4 pricing logic while Phase 2 image pipeline is unfinished.
2. **Commit after every phase**, with a message referencing the phase number (e.g. `Phase 2: image enhancer pipeline working end-to-end`). This gives the team a rollback point if a later phase breaks something.
3. **Never fabricate API responses or mock data as if real** in a way that could survive into the demo unnoticed. If you stub something (e.g. GeM push button), label it clearly in code AND in UI as "Preview / Coming Soon" — a judge clicking a fake-working button that does nothing is worse than an honest "future feature" label.
4. **Keep secrets out of the repo.** Use `.env` files, add to `.gitignore` immediately in Phase 0.
5. **Every AI/external API call must have a fallback or graceful error path.** Venue wifi will be unreliable. A crash on a failed API call is not acceptable — show a retry button or cached result instead.
6. **Don't build for scale.** No need for caching layers, queues, load balancers, microservice sprawl beyond the one rembg service. This is a demo for 2 days, not a production system serving thousands of artisans (yet).

## File/folder structure to scaffold in Phase 0
```
/app                 (Expo React Native app)
/backend             (Node/Express API)
/services/rembg      (Python FastAPI microservice for background removal)
/n8n-workflows       (exported .json workflow files, see N8N_WORKFLOWS.md)
/docs                (this file, PRD.md, PHASES.md, TECH_STACK.md, N8N_WORKFLOWS.md)
```

## Coding conventions
- TypeScript everywhere in `/app` and `/backend` — not because it's "best practice" in the abstract, but because it catches integration bugs between mobile and backend faster than a runtime error during a live demo will.
- Keep API contracts documented as you build them — add request/response shape as comments above each Express route handler. The team member writing the pitch deck needs to know what actually works, not what was planned.
- Every screen in `/app` should handle: loading state, error state, empty state. This is not optional polish — it's what stops the app looking broken when a judge pokes at it in an unexpected order.

## When starting a session with a coding agent, always paste this priming instruction:
"We are building the MVP defined in /docs/PRD.md, following /docs/PHASES.md phase by phase. Current phase: [X]. Do not expand scope beyond what phase [X] defines. Ask before installing any new major dependency."

## Definition of done for each phase
A phase is NOT done when the code compiles. It's done when a team member who didn't write the code can use the feature on a real device without being told how.
