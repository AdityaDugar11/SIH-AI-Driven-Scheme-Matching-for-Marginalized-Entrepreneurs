# System Architecture

## 1. Tech Stack Overview
- **Frontend:** Next.js (React), Tailwind CSS (Progressive Web App).
- **Backend:** Node.js (Express) or Python (FastAPI - better for AI logic).
- **Database:** PostgreSQL (for relational data like Users, Schemes, Partners).
- **Automation/Workflows:** n8n (Self-hosted or Cloud).
- **AI/ML:** OpenAI API or local LLM for Natural Language Search and Match Scoring.

## 2. Component Diagram
1. **Client (PWA):** Sends User Profile data to Backend.
2. **Backend API:**
   - Routes profile data to the **Matching Engine**.
   - Queries the **Schemes DB**.
   - Calculates Gap Analysis.
   - Returns Match Scores and reasons.
3. **n8n Server:** Listens for webhooks from Backend to trigger emails and deadline alerts.

## 3. Database Schema (High-Level)
- **User:** ID, Name, Phone, Demographics, Income, Project Details.
- **Scheme:** ID, Name, Type, MaxLoan, IncomeLimit, CasteCriteria, InterestRate.
- **Partner:** ID, Name, Location (Lat/Lng), NPAScore, ActiveStatus.