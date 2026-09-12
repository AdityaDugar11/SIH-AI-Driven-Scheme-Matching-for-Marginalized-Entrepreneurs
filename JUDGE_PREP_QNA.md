# Smart India Hackathon: Pitch & Judge Q&A Guide

This document contains everything you need to confidently explain your project to the SIH judges, including answers to past questions and detailed explanations of your architecture.

---

## 1. The Core Problem & Solution

**The Problem:**
Marginalized entrepreneurs (SC/ST/OBC communities, women, rural citizens) want to start small businesses (like a dairy farm, tailor shop, or transport service) but lack capital. The government has hundreds of highly concessional loan schemes for them, but citizens don't know they exist, can't understand the complex eligibility criteria, and don't know which bank to apply to.

**The Solution (Our App):**
An AI-driven platform that takes a user's basic profile (Income, Caste, Gender, Age) and their natural language request ("I want a loan for a dairy farm"), instantly matches them with the exact government schemes they are eligible for, and automatically routes their application to the correct local bank branch via automated workflows.

---

## 2. Past Judge Questions (Rounds 1 & 2)

### Q1: "Are the users taking a loan or investing?"
**Answer:** 
Our users are **taking loans** (receiving financial assistance). They are NOT investors. Our target audience consists of marginalized individuals who need capital. Our application helps them find and apply for government-subsidized loans at very low-interest rates so they can become self-reliant entrepreneurs.

### Q2: "What is the 'Partners' sheet? Are we getting loans from those banks? Why are they here?"
**Answer:**
Yes, the loans are disbursed by these banks! Here is how the government system works:
1. Apex government bodies (like NSFDC - National Scheduled Castes Finance and Development Corporation) have the money, but **they do not give cash directly to citizens**.
2. Instead, they route the funds through **Channelizing Partners**—these are Public Sector Banks (SBI, PNB), Regional Rural Banks (RRBs), and State Channelizing Agencies (SCAs).
3. **Why they are in our database:** Our platform acts as a bridge. When a user clicks "I am Interested" in a scheme, our backend looks up the nearest Channelizing Partner in our database and uses our **n8n Automation Workflow** to instantly email the user's lead/application data directly to that specific bank branch manager. 
4. **Risk Refresh:** We also track the "NPA (Non-Performing Asset) Risk" of these partners. If a bank branch is failing to disburse loans properly, our automated cron jobs flag them as "High Risk" so we stop sending poor citizens to a dead-end branch!

---

## 3. Potential Questions Judges Might Ask Now

### Q: "How are you matching the schemes?"
**Answer:**
We digitized massive amounts of complex government scheme PDFs and converted them into a structured database. We use **Google Gemini AI** in our Python Backend to dynamically compare the user's socio-economic profile (Income, Caste) against the scheme's criteria. The AI returns a "Match Percentage" and explains exactly *why* they match (e.g., "You match 100% because your income is below ₹3,00,000 and you belong to the SC category").

### Q: "What technologies did you use?"
**Answer:**
- **Frontend:** React + Vite (for a fast, mobile-friendly user interface).
- **Database & Auth:** Supabase (secure user authentication and profile storage).
- **Backend:** Python FastAPI (handles the AI logic and database queries rapidly).
- **AI Engine:** Google Gemini (parses natural language and evaluates eligibility).
- **Automation:** n8n (handles webhooks, cron jobs, and automated email routing between citizens and banks).

### Q: "What if the user speaks Hindi?"
**Answer:**
We built real-time localization. If the user toggles the language to Hindi on the dashboard, the frontend passes a language parameter to our Python backend, and the AI translates the entire scheme description and match reasoning into Hindi on-the-fly before sending it to the screen.

### Q: "How does the automated email/lead system work?"
**Answer:**
We built 3 core workflows in **n8n**:
1. **Lead Intake:** When a user applies, a webhook fires. n8n splits the flow—it emails the applicant a confirmation, and emails the bank partner the lead details.
2. **Deadline Tracking:** A daily cron job fetches schemes that are expiring soon and emails users to hurry up.
3. **Partner Risk Refresh:** A weekly cron job fetches data to update the "Health" or "Risk Status" of partner banks so we always route users to efficient branches.

---

## 4. How to demo the app to the judges
1. **Start at the Onboarding:** Show them how easy it is for an uneducated citizen to enter just their age, income, and caste.
2. **The Dashboard:** Show the AI schemes matching perfectly. Change your income in the "Settings Modal" and show how the AI instantly changes the schemes and percentages!
3. **The Webhook:** Click "I am Interested".
4. **The Proof:** Show them the n8n execution succeeding, and then open your Gmail to prove the email actually arrived instantly!
