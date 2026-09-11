# N8N Workflows & Automation

We use n8n for background automation, emails, and notifications. We are using standard n8n nodes. Below is the markdown prompt/instructions you can give to your team members responsible for n8n.

## Workflow 1: "Interested Scheme" Email Notification
**Trigger:** Webhook (POST request from our backend when user clicks "I am interested" on a scheme).
**Nodes Required:**
1. **Webhook Node:** Listens for payload `{ userEmail, userName, schemeName, schemeDetailsURL }`.
2. **HTML Node / Markdown Node:** Formats a beautiful email template.
3. **Send Email Node (SMTP or SendGrid/Mailgun):** Sends the email to the user with the scheme details.

## Workflow 2: Deadline Tracking & Alerts
**Trigger:** Cron Schedule (Runs every day at 8:00 AM).
**Nodes Required:**
1. **Schedule Trigger:** Set to daily.
2. **HTTP Request Node:** Fetch users and their saved schemes nearing deadlines from our backend API (e.g., `GET /api/schemes/expiring-soon`).
3. **Item Lists Node / Split In Batches:** Iterate through the users.
4. **Send Email Node / Push Notification (Firebase):** Send "Hurry! Scheme X deadline is approaching in 5 days."

## Workflow 3: Partner NPA Risk Refresh
**Trigger:** Cron Schedule (Runs weekly).
**Nodes Required:**
1. **Schedule Trigger:** Weekly.
2. **HTTP Request Node:** Fetch latest NPA/Overdue data from Gov/Bank APIs (or our mock API).
3. **PostgreSQL/MongoDB Node:** Update the Channel Partner database records with their latest eligibility status to ensure users are not routed to suspended partners.
