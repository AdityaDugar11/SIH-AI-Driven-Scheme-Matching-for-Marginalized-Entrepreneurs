# PITCH_QA.md — For the 2 presentation team members

Read PRD.md section 2 ("Reality check") first — every answer below is built on being upfront about what's real vs simulated. Do not deviate from that in Q&A; getting caught contradicting your own disclosure slide is far worse than the limitation itself.

## Demo script (3 minutes)
1. **Problem (30s)**: SC-category citizens eligible for concessional loans (6.5-8% interest, up to 90% funding) don't know which of 100+ schemes/partners fits them, causing misrouted applications and delays.
2. **Live demo (90s)**: Fill the intake form live → show recommendation + reason → show EMI breakdown → show nearest partners on map → show the lead land in the Google Sheet + confirmation email arrive (this is the moment that proves it's real, not a mockup).
3. **Impact + honesty slide (60s)**: What's real (recommender, calculator, locator, automation) vs simulated (partner risk/NPA score — state the real production data source: NBCFDC/SCA MIS). Close with the transparency/efficiency impact goals from the problem statement.

## Anticipated questions and answers

**Q: Is this actually AI, or just if/else logic?**
A: The eligibility engine is deliberately rule-based and deterministic, not a trained model — for a financial product deciding who qualifies for a loan, auditability matters more than sophistication. A black-box ML model would be a liability here, not a feature. We use AI/NLP specifically where it adds value without removing transparency: generating the plain-language explanation of why a scheme was recommended, and (if included) parsing free-text user input into structured fields.

**Q: Where does the partner risk/NPA/fund-utilization data come from?**
A: In this build it's simulated and clearly labeled as such in the UI. In production, this would integrate with NBCFDC's or the relevant SCA's MIS system via API — that's the identified integration point. We chose to disclose this rather than present fabricated numbers as live data.

**Q: How do you verify a user's claimed income or eligibility?**
A: We don't — that's intentionally out of scope. This is a recommendation and routing tool, not a verification or disbursement system. Income/document verification stays with the channel partner during actual application, exactly as it works today. We're solving the "which scheme, which partner" confusion, not replacing underwriting.

**Q: What happens after a lead is routed to a partner — do you handle the actual loan application?**
A: No. The workflow ends at "partner has been notified and applicant has partner contact info." Full application submission and processing remains with the existing channel partner system. Automating that would require integration with each partner's internal systems, which is outside a 2-day build and arguably outside this problem statement's ask.

**Q: Why no login/user accounts?**
A: Not needed for the core problem — a citizen doesn't need an account to get a one-time recommendation. Removing auth let us spend the time budget on the actual scheme-matching and locator logic instead of session management.

**Q: Is the map/location data live and accurate for all 100+ channel partners?**
A: We built a representative dataset of ~30-50 partner branches for the demo, not a live-scraped registry of all 100+ organizations — that data isn't publicly available in a structured, scrapeable form. Production deployment would require a data-sharing agreement with NBCFDC to get the authoritative partner list.

**Q: How does this scale beyond SC-category schemes to other categories (OBC, ST, minorities, etc.)?**
A: The architecture is scheme-agnostic — `schemes.json` is a data file, not hardcoded logic, so adding another category's scheme rules is a data-entry task, not a re-engineering task. Good follow-up point to make proactively if you have time in the pitch, it shows forward thinking without overclaiming current scope.

**Q: What's your biggest technical risk if this went to production?**
A: Getting reliable, real-time fund-utilization/NPA data feeds from 100+ heterogeneous partner organizations (SCAs, PSBs, RRBs, NBFC-MFIs) with different IT maturity levels — that's a data integration and partner-onboarding problem, not a software problem, and it's the honest bottleneck. Say this proactively if asked about "next steps" — it shows you understand the real-world deployment challenge, not just the code.

**Q: Multi-lingual — how many languages do you actually support?**
A: English and Hindi for this build; the i18n structure supports adding more languages as a data-entry task (translated JSON dictionary), not a code change.

## What NOT to say
- Don't say "the AI predicts eligibility" — it doesn't predict, it applies fixed rules. Say "recommends based on scheme criteria."
- Don't say the partner risk score is "real-time" or "live" — say "simulated, with the production data source identified."
- Don't claim the platform "processes loan applications" — it recommends and routes, it doesn't process.
- Don't guess a number you don't know (e.g., actual current NPA rates, exact partner count) — say "that's not something we had access to for this build" rather than inventing a figure.
