# PITCH_QA.md — Hard Questions Judges Will Ask, With Honest Answers

Presentation team: memorize these, don't improvise under pressure. Honest, confident answers beat confident-sounding lies every time — judges have seen a hundred teams bluff.

**Q: Is the pricing model trained on real market data?**
A: "The MVP uses researched benchmark pricing across [8-10] handicraft categories combined with artisan-entered material costs. The architecture — via our n8n scheduled workflow — is built to ingest live marketplace price feeds once we have API access to sources like GeM, so it can move from benchmark-based to live-data-based without a redesign."

**Q: Does this actually connect to GeM (Government e-Marketplace)?**
A: "Not in this MVP — GeM API access requires formal registration/approval we couldn't complete in the hackathon window. We show a 'push to GeM' flow as a UI preview to demonstrate the intended integration point."

**Q: What languages does it actually support right now?**
A: State exactly what you built — likely Hindi + English, maybe one more. Don't say "all Indian languages" — say "the pipeline is language-agnostic since it's built on Bhashini/Whisper, adding a language is a config change, not a rebuild, but we've tested and demo [X] and [Y]."

**Q: How does the background removal actually work — did you build that?**
A: "We use an existing open-source background removal model (rembg) — building a segmentation model from scratch wasn't realistic in this timeframe, and there's no reason to reinvent it. Our contribution is the pipeline: capture, clean, format to e-commerce standard, all in one artisan-facing flow."

**Q: How would this scale to thousands of artisans?**
A: Be honest about what's demo-grade vs production-grade: "Today it's a single backend instance — for scale we'd move the async processing to a queue (the n8n workflow already models this as an async job), and the AI calls would move to batch processing during off-peak hours to control cost." Don't claim it already scales.

**Q: What's your monetization / sustainability model?**
A: Think about this honestly before the pitch — options: government subsidy/scheme integration, small commission on B2B sales facilitated, freemium (basic free, advanced analytics/promotion paid). Pick one and be able to defend it, don't list all three vaguely.

**Q: What if the artisan doesn't trust the AI-generated description or price?**
A: "Every AI output is editable before publishing — nothing goes live without the artisan's confirmation. This isn't full automation, it's assisted automation, which matters for trust with a low-digital-literacy user."

**General rule for the presentation team:** if you don't know the answer, say "that's not in our current MVP scope, here's how we'd approach it" — do not guess. Judges ask harder follow-ups to teams who bluff.
