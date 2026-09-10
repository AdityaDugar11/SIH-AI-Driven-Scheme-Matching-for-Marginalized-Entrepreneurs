# N8N_WORKFLOWS.md — Automation layer

## Why n8n is even in this project
It maps directly to the problem statement's stated impact goal: "Improve transparency and efficiency in the channel finance ecosystem, ensuring faster disbursements and better fund utilization." It is NOT for your eligibility logic — that stays in your backend (see INSTRUCTIONS.md). n8n automates what happens *after* a recommendation is made.

Build exactly 2 workflows. Do not add more — a 3rd workflow is polish you don't have time for.

---

## Workflow 1: Lead Capture + Notification
**Trigger**: your app backend calls a Webhook node when a user completes the intake form and gets a recommendation.

**Nodes (in order)**:
1. **Webhook** — receives POST with: `{name, phone, email, income, scheme_recommended, project_cost, emi, nearest_partner_id, nearest_partner_name, nearest_partner_email}`
2. **Set/Edit Fields** — normalize/format the payload (e.g., format currency, timestamp the lead)
3. **Google Sheets (Append Row)** — log the lead to a "Leads" sheet — this is your live, judge-visible proof of "transparency and tracking" in the ecosystem
4. **IF node** — branch on `scheme_recommended` (Micro Finance / Term Loan / Education Loan) — mainly to prove branching logic works live, even if the downstream action is similar
5. **Gmail/Email node** — send the applicant a confirmation email: scheme name, EMI summary, nearest partner contact — this is the "faster disbursement, less confusion" payoff, made visible
6. **Gmail/Email node (2nd branch)** — notify the matched channel partner that a new eligible lead has been routed to them — this is literally solving "misrouted applications" from the problem statement, show it
7. **Respond to Webhook** — return success/failure to your app so the frontend can show "lead sent to partner X" confirmation

**Demo moment**: submit a form live, then show the Google Sheet row appear + the email land, in real time. This is a strong, visual, honest demo — no simulated data needed here.

---

## Workflow 2: Partner Risk Score Refresh (simulation, disclosed)
**Trigger**: Manual trigger button (click "Run" live during demo) or Schedule trigger (e.g., every 10 min) — manual is better for demo control.

**Nodes**:
1. **Manual Trigger** (or Schedule Trigger)
2. **Google Sheets (Read) — "Partners" sheet** — pulls current partner list + existing risk scores
3. **Function/Code node** — apply a simple simulated formula (e.g., randomize ±5 within bounds, or cycle based on a "days since last audit" column) — clearly comment in the node that this simulates what would be a real NPA/fund-utilization feed from NBCFDC/SCA MIS in production
4. **Google Sheets (Update)** — write updated risk scores back
5. **Slack or Email node (optional)** — notify an "admin" channel that partner risk data was refreshed, showing the transparency/monitoring angle

**Demo moment**: click the trigger live, show the Sheet values update, and say out loud: "In production this node pulls from NBCFDC's MIS; today it's simulated — here's the exact integration point." This turns your weakest technical gap into a moment of credibility, not a caught-out lie.

---

## Node summary checklist (build order)
- [ ] Webhook (Workflow 1 entry)
- [ ] Set node
- [ ] Google Sheets Append (Leads)
- [ ] IF node
- [ ] Email node ×2 (applicant + partner)
- [ ] Respond to Webhook
- [ ] Manual Trigger (Workflow 2 entry)
- [ ] Google Sheets Read (Partners)
- [ ] Function/Code node (simulate risk)
- [ ] Google Sheets Update
- [ ] (optional) Slack/Email admin notify

## Credentials needed before you start
- Google account with Sheets API access authorized in n8n (do this FIRST, OAuth setup wastes time if left until hour 20)
- Gmail (or any SMTP) credential authorized in n8n
- Two Google Sheets created ahead of time: "Leads" (empty, headers only) and "Partners" (pre-filled with your ~30-50 static partner records from `data/partners.json` — keep this the same source of truth as your backend's locator, or you'll get inconsistent demo numbers)

---

## Direct prompt for n8n's built-in AI Workflow Builder
Paste this into n8n's AI workflow assistant (or into Claude/ChatGPT if generating workflow JSON manually to import):

```
Build an n8n workflow for a loan-scheme recommendation app. 

Workflow 1 - "Lead Notification":
1. A Webhook node (POST) that receives JSON: name, phone, email, income, scheme_recommended, project_cost, emi, nearest_partner_id, nearest_partner_name, nearest_partner_email.
2. A Set node that formats project_cost and emi as currency strings and adds a timestamp field.
3. A Google Sheets node that appends this data as a new row to a sheet named "Leads".
4. An IF node that branches on scheme_recommended (three possible values: "Micro Finance", "Term Loan", "Education Loan") - all branches proceed to the same next steps, this is just for visible branching logic.
5. A Gmail node that sends an email to the "email" field: subject "Your Loan Scheme Recommendation", body including scheme_recommended, emi, and nearest_partner_name with contact info.
6. A second Gmail node that sends an email to "nearest_partner_email": subject "New Lead Routed to You", body including applicant name, phone, scheme_recommended, and project_cost.
7. A Respond to Webhook node returning {"status": "success", "partner_notified": true}.

Workflow 2 - "Partner Risk Refresh":
1. A Manual Trigger node.
2. A Google Sheets node that reads all rows from a sheet named "Partners" (columns: partner_id, name, type, lat, lng, contact_email, risk_score).
3. A Code node (JavaScript) that takes each row and adjusts risk_score by a random value between -5 and +5, clamped between 0 and 100, and adds a "last_updated" timestamp. Add a code comment explaining this simulates a production feed from a real fund-utilization/NPA data source.
4. A Google Sheets node that updates the "Partners" sheet with the new risk_score and last_updated values, matching by partner_id.

Use Google Sheets nodes with OAuth2 credential type. Use Gmail nodes with OAuth2 credential type. Keep node names descriptive and add sticky notes explaining each workflow's purpose for a hackathon demo.
```

If the AI builder can't generate directly from this prompt, build the nodes manually one at a time in this order — it's ~25 minutes of clicking, not a big lift, don't over-invest trying to get one perfect auto-generated JSON.
