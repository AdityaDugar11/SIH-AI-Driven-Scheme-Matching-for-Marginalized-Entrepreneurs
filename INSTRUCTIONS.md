# AI Agent Instructions

Welcome, AI Agent (Claude, Antigravity, Freebuff, etc.). This repository contains the documentation and codebase for the SIH 2024 AI-Driven Scheme Matching platform.

## How to use this documentation:
1. **Always read `PRD.md`** to understand the business logic, requirements, and features.
2. **Read `PHASES.md`** to understand what phase we are currently in. Do not build Phase 3 features if we are in Phase 1.
3. **Read `Architecture.md`** for tech stack and structural decisions.
4. **Follow `Rules.md`** strictly for coding conventions.
5. **Use `Memory.md`** before starting any new session to restore context, and update it when you finish a session.
6. **Use `Decisions.md`** to record ANY significant architectural or design decision you make (ADRs).

## Workflow for Agents:
1. Review the user's prompt.
2. Cross-reference with `Memory.md` to see what was done previously.
3. Plan your implementation.
4. Execute code changes.
5. Update `Memory.md` with your progress to prevent token waste in future prompts.
6. Update `Decisions.md` if you chose a specific library, architecture pattern, or database schema.
