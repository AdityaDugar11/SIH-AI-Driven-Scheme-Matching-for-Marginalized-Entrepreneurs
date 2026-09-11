# Development Phases

## Phase 1: Foundation, Auth & Dashboard (Current Priority)
- **Goal:** Get users into the system and capture their data accurately.
- **Tasks:**
  - Setup Next.js PWA framework (Mobile-first responsive design).
  - Setup Authentication (Login/Signup).
  - Build User Profiling flow (Name, Age, Income, Caste, Location, Education, Project Details).
  - Build the main Dashboard UI to display profile completion and "Interested" schemes placeholder.

## Phase 2: AI Recommendation Engine & Filtering
- **Goal:** Implement the core matching logic.
- **Tasks:**
  - Develop the Smart Scheme Recommender (Rule-based + AI).
  - Implement Match Scoring (e.g., 75% match, 100% match).
  - Build Eligibility Gap Analysis ("Why Eligible" / "Why Not Eligible").
  - Create the Document Checklist generator based on the matched scheme.
  - Implement Dashboard filtering (filter schemes by Central/State/Location/Match %).

## Phase 3: Natural Language Search & Localization
- **Goal:** Improve accessibility.
- **Tasks:**
  - Integrate an AI chat interface for natural language scheme searching.
  - Implement Multi-lingual support (i18n) for the entire app.

## Phase 4: Geo-Spatial Partner Locator & Financial Tools
- **Goal:** Fulfill the complete problem statement requirements.
- **Tasks:**
  - Integrate Map APIs (e.g., Google Maps / Mapbox).
  - Build the Partner Locator showing nearest Channel Partners.
  - Add logic to filter out partners with high NPAs (mock data for now).
  - Build the dynamic Financial EMI Calculator.

## Phase 5: Automation & Notifications (n8n Integration)
- **Goal:** User retention and action tracking.
- **Tasks:**
  - Setup n8n workflows for "Interested Scheme" emails.
  - Setup deadline tracking and cron jobs for push/email notifications for expiring schemes.
