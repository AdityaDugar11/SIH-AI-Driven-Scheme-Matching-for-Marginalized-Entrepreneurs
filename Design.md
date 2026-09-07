# Design.md — Visual design system

This is visual tokens/style only. For screen layout and behavior, see `UI.md`. Don't duplicate content between the two — if you're describing what a screen *does*, it belongs in UI.md; if you're describing what it *looks like* (color, font, spacing), it belongs here.

## Why the visual direction matters for this specific app
The user may have low financial literacy and reading a phone in bright sunlight/a crowded space. This is not a place for a trendy, low-contrast, small-text fintech aesthetic. Prioritize legibility and trust signals over "sleek."

## Color palette
- Primary: a single trustworthy blue or green (government-scheme association — avoid red/orange as primary, they read as "warning" or "urgent" in financial contexts)
- Success/positive (eligible, confirmed): green
- Warning (not eligible, simulated-data disclosure): amber, not red — red reads as an error, but "not eligible" isn't an error, it's information
- Neutral background: off-white, not pure white (reduces glare) or a light neutral gray
- Text: near-black on light backgrounds, minimum 4.5:1 contrast ratio everywhere — don't use light-gray-on-white body text

## Typography
- One font family, system font stack is fine (`-apple-system, "Segoe UI", Roboto, sans-serif`) — don't spend time loading a custom web font, it's not worth the load-time risk for a demo
- Base body size: 16px minimum, larger on mobile (18px) — this audience needs bigger text than a typical SaaS product
- Headings: bold weight, clear size jump from body text (at least 1.5x)
- Numbers (EMI, amounts): largest and boldest text on any screen they appear on — the number IS the content, not decoration around it

## Spacing & layout
- Generous padding — don't cram. Touch targets (buttons) minimum 44px height for mobile tapping.
- Single-column layout on mobile always. Two-column only on desktop breakpoints, and only where it doesn't hurt mobile.
- Max content width ~600-700px even on desktop — don't stretch a form across a wide screen, it hurts readability.

## Iconography
- Use icons only to support text labels, never instead of text labels (this audience shouldn't have to guess what an icon means)
- The disclosure tooltip (ⓘ) for simulated data should be visually consistent everywhere it appears — same icon, same color, same interaction (tap/click to reveal, not hover-only, since mobile has no hover)

## Component visual specs
- **Buttons**: primary color fill for main CTA, one per screen max — don't compete for attention. Secondary actions as outline/text buttons.
- **Cards** (partner list, scheme result): subtle border or shadow, rounded corners (moderate, not excessive — 8px is plenty), enough padding to not feel cramped
- **Map markers**: color-code by risk_score band if time allows (green/amber/red) but always pair with the text list — never rely on color alone (accessibility, and colorblind users)
- **Progress/step indicator**: simple dots or "Step X of 4" text — don't build an elaborate progress bar animation

## Language toggle placement
Top-right corner, persistent across all screens, always visible without scrolling — this is a core accessibility feature for this user base, not a settings-menu afterthought.

## What to skip
- No custom illustrations or generated art — a plain, clean layout with good typography beats mediocre generated graphics for this kind of civic-utility tool, and illustrations cost time you don't have
- No dark mode (see UI.md cut list)
- No complex animations — simple fade/transition on screen change is enough, if any
