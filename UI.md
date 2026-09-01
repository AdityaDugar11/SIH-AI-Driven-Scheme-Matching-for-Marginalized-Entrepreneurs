# UI.md — Screen-by-screen spec for frontend team

This does not replace PHASES.md (still your build order/timing). This is what to actually put on each screen. Read TECH_STACK.md for the API contract these screens call.

## Design principles for this specific app (not generic advice — these matter for THIS user)
- Target user may have low financial literacy and low English proficiency. Large text, minimal jargon, no dense paragraphs.
- Every number (EMI, interest rate, loan amount) needs a one-line plain-language label next to it, not just a figure.
- Mobile-first. Assume the primary device is a phone, not a laptop. Test every screen at ~375px width before anything else.
- No dead ends: every screen has an obvious next action.

## Screen 1: Landing / Intake Form
**Purpose**: collect the 4 inputs needed for `/recommend`.

Fields:
- Annual family income (number input, ₹, with helper text "Must be ₹5,00,000 or below to qualify")
- What is this loan for? (radio/select: Small Business / Larger Business Project / Education)
- Estimated project or course cost (number input, ₹)
- Location (city dropdown for demo simplicity, OR "use my location" button using browser geolocation as a stretch goal — city dropdown is the safe default, don't depend on geolocation permission working live on stage)
- Language toggle visible at top (English / हिंदी) — must work on this screen too, not just later screens

CTA button: "Find My Scheme" → calls `/recommend`, navigates to Screen 2.

Validation: income >₹5L should still submit but show ineligibility message on Screen 2, not block the form — don't punish the user for finding out they don't qualify, that's useful information too.

## Screen 2: Recommendation Result
**Purpose**: show the matched scheme and why.

Layout:
- Big, clear scheme name at top (e.g., "Micro Finance Scheme")
- 1-2 sentence plain-language reason underneath (from API `reason` field)
- If `eligible: false` — show this clearly with a short explanation of why not, and if there's a near-miss alternate, mention it
- "Alternates" shown smaller/secondary, not competing visually with the main recommendation
- CTA: "See EMI Breakdown" → Screen 3

## Screen 3: EMI Calculator
**Purpose**: show the financial breakdown, allow tenure adjustment.

Elements:
- Loan amount vs applicant's own contribution (90/10 split), shown as two labeled numbers, not just one total
- Tenure selector (slider or dropdown, months) — recalculates EMI live via `/calculate-emi`
- EMI amount, large and prominent
- Interest rate, moratorium period, total interest — smaller, secondary info
- Simple visual (bar or two-segment progress bar showing loan vs contribution) — don't over-engineer this, a labeled bar is enough, no need for a charting library
- CTA: "Find Nearest Partner" → Screen 4

## Screen 4: Partner Locator
**Purpose**: show nearest eligible channel partners.

Elements:
- Map (Leaflet) with markers for top 3 partners from `/nearest-partners`
- Below/beside map: list view of same 3 partners — distance, type (SCA/PSB/RRB/NBFC-MFI), contact info
- Each partner card shows a small "eligibility indicator" (based on risk_score) with a ⓘ tooltip: "Simulated data — production version integrates with NBCFDC/SCA MIS." This tooltip is not optional — it's your live disclosure, don't skip it under time pressure.
- CTA: "Send My Details to This Partner" — triggers the POST to the n8n Webhook (per N8N_WORKFLOWS.md), then shows a confirmation state ("Your details have been sent to [Partner Name]. Check your email.")

## Screen 5: Confirmation
**Purpose**: close the loop, visible proof the automation ran.

Elements:
- Simple success state: scheme name, EMI, partner name/contact, "Check your email for confirmation"
- "Start Over" button → back to Screen 1

## Shared components (build once, reuse across screens)
- `LanguageToggle` — persists selection across screens (React context or URL param, not localStorage per artifact rules if this is ever built as an artifact; for a real deployed app localStorage is fine)
- `CurrencyDisplay` — formats numbers as ₹ with commas, used everywhere money is shown
- `InfoTooltip` — small ⓘ icon + popover, used for the simulated-data disclosure and any other plain-language help text
- `StepHeader` — shows progress (Step 2 of 4) so the user always knows where they are in the flow

## Explicitly cut from UI scope (don't build)
- No user account / profile screens
- No "save for later" or session persistence across visits
- No admin dashboard
- No animated transitions beyond basic CSS — don't spend time on page-transition libraries
- No dark mode

## Component build order (maps to PHASES.md Phase 2-4)
1. Screen 1 (Intake) + LanguageToggle + CurrencyDisplay
2. Screen 2 (Recommendation)
3. Screen 3 (Calculator)
4. Screen 4 (Locator + Map) + InfoTooltip
5. Screen 5 (Confirmation)
6. Hindi translations pass across all screens (last, per PHASES.md Phase 4)
