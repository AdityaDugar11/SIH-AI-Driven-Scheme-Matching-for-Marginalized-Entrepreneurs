# SchemeMatcher 🚀
**Smart India Hackathon 2026 Project**

SchemeMatcher is an AI-powered platform designed to help marginalized entrepreneurs—including women, rural youth, SC/ST/OBC communities, persons with disabilities, and informal business owners—discover and apply for government schemes and financial assistance tailored precisely to their personal profiles and business needs.

## 🎯 Problem Statement
**Title:** AI-Driven Scheme Matching for Marginalized Entrepreneurs  
**Theme:** Smart Automation

Navigating government schemes is historically difficult due to fragmented information, complex eligibility criteria, language barriers, and lack of digital literacy. SchemeMatcher bridges this gap by automatically parsing a user's demographic and financial profile and utilizing AI to match them with the exact schemes they qualify for, drastically reducing confusion and repeated visits to government offices.

## ✨ Key Features
- **Intelligent AI Recommendation Engine:** Analyzes user profiles against a comprehensive database of central and state schemes using Google Gemini AI to calculate eligibility percentages and provide personalized reasoning.
- **Multilingual Support (i18n):** Breaks down language barriers, allowing users to navigate and understand complex government schemes in their native language (e.g., English, Hindi, etc.).
- **Seamless Application Tracking:** Users can directly apply to matched schemes and track their application status (Under Review, Approved, Rejected) in real-time.
- **Integrated EMI Calculator:** Helps entrepreneurs dynamically calculate monthly loan repayments based on scheme-specific interest rates and loan amounts.
- **Save & Compare:** Bookmark schemes for later review.
- **Offline / Partner Locator:** Find nearby government offices, NGOs, and partner banks for physical assistance.

## 🛠️ Technology Stack
**Frontend:**
- React (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- Lucide React (Icons)
- React i18next (Internationalization)

**Backend:**
- Python (FastAPI)
- Google Gemini API (AI Reasoning Engine)
- SQLite (Application & Saved Scheme Persistence)
- Supabase (Authentication & User Profiles)

## 🚀 Local Development Setup

To run this project locally on your machine, follow these steps:

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Supabase Account (for Authentication)

### 1. Backend Setup
Navigate to the backend directory and set up your Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set up your `.env` file in the `backend` directory with your Gemini API key:
```env
GEMINI_API_KEY=your_google_gemini_api_key
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
*(Note: The local SQLite database `db.sqlite3` will automatically initialize upon the first API request).*

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

### 3. Access the Application
Open your browser and navigate to `http://localhost:5173`. Create an account, complete the onboarding profile, and view your personalized scheme matches!

## 🏗️ Architecture Flow
1. **User Onboarding:** The user logs in via Supabase Auth and fills out a demographic/financial profile.
2. **AI Matching:** The frontend sends the profile to the FastAPI backend. The backend uses Google Gemini to evaluate the profile against the scheme database (`schemes.json`).
3. **Data Persistence:** When a user clicks "Apply" or "Save", the action is recorded in the local SQLite database via the backend API.
4. **UI Updates:** The React frontend updates instantly using optimistic rendering, fetching the latest state from the backend.

## 🤝 Contributing
This project is built for the Smart India Hackathon.