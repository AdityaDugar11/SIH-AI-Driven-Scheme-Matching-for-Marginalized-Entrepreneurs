# System Overview & Architecture Notes

This document provides a short, high-level overview of how our platform works, how the database is structured, how the scheme matching algorithm makes its decisions, and the overall workflow. This is meant as a quick reference guide for all team members before the final presentation.

## 1. Database Architecture
**What database are we using?**
We are using **Supabase** (which is built on top of a PostgreSQL database). 

**Why Supabase?**
- It handles **User Authentication** securely (Signups, Logins, Email Verifications) right out of the box.
- It provides a `profiles` table to store all the data we collect from the Onboarding flow (income, caste, state, project type, etc.).
- It uses **Row Level Security (RLS)**, which means we can write rules at the database level ensuring a user can only ever read or update their *own* profile.

## 2. Scheme Matching Algorithm
Our scheme matching is handled by our **Python FastAPI backend** (`backend/schemes_db.py`). 

**Is it AI?**
No, the core matching engine is **Deterministic Rules-Based**. We intentionally *did not* use AI for the actual eligibility checks because government scheme eligibility must be 100% accurate, auditable, and not a "black box" that might hallucinate. 

**(Note: We do use AI for the Floating Chatbot, but NOT for deciding if you get a loan or not).**

**How does the Match Percentage work?**
Every user starts with a perfect **100% Match Score** for a scheme. The backend then runs their profile through a gauntlet of rules for that specific scheme, deducting points if they fall short:
- **Income Exceeds Limit:** `-50%` (Automatically marks them as Ineligible).
- **Wrong Caste/Gender:** `-100%` (Automatically marks them as Ineligible).
- **Wrong Project Type:** `-80%` (Automatically marks them as Ineligible).
- **Project Cost exceeds Scheme Limit:** `-25%` (The user is *still Eligible*, but their score drops to 75% as a "Warning" because they will have to fund the extra cost out of their own pocket).

Any score above `0` with no hard blocks means the user is officially Eligible.

## 3. Overall Workflow
Here is exactly what happens from the moment a user arrives on the site:

1. **Signup:** User creates an account on Vercel (Frontend). Supabase handles the auth and sends the verification email via our Custom Google SMTP.
2. **Onboarding:** User fills out a 4-step form. This data is saved directly into the Supabase Postgres `profiles` table.
3. **Dashboard Load:** The Frontend hits our Python Backend (`/api/recommend`) with the user's profile data.
4. **Processing:** The Python Backend runs the deterministic matching algorithm and calculates scores and limits.
5. **Display:** The user sees their eligible schemes, EMI calculators, and a Map showing nearby partner banks.
6. **AI Chat (Optional):** The user can click the floating chat icon to ask questions. The Frontend sends the chat to the Python Backend, which talks to the Gemini 2.5 API and replies in their chosen local language.
7. **Expression of Interest:** When a user clicks "I'm Interested" on a scheme, the Python Backend fires a payload to **n8n (Workflow Automation)**.
8. **n8n Automation:** n8n catches the webhook, saves the lead into a Google Sheet, and automatically emails the user a list of documents they need to prepare before visiting the bank.

---

## 4. What's Next? (Action Items)
1. **Un-comment n8n Webhook:** In `backend/main.py`, the `requests.post(N8N_WEBHOOK_URL)` is currently commented out. Once your n8n workflow is live, you need to paste in the real URL and uncomment that code.
2. **Integrate Real Data:** The current `schemes_db.py` only has 4 mock schemes. Once the research team finishes the CSV of real schemes, we need to convert that CSV into the JSON structure used by the Python backend.
3. **Practice the Demo:** Rehearse the flow! Start at signup, fill the profile, show the AI chatbot answering in Hindi, calculate an EMI, click "I'm Interested", and show the resulting email in the inbox.
