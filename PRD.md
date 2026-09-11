# Product Requirements Document (PRD)
**Project Name:** AI-Driven Scheme Matching for Marginalized Entrepreneurs (SIH 2024)

## 1. Background & Challenge
To promote the socio-economic empowerment of the Scheduled Caste (SC) population, the government provides concessional financial assistance. Beneficiaries with annual family income up to ₹5.00 Lakhs are eligible for schemes covering up to 90% of costs at concessional interest rates (6.5% - 8%).
**Challenge:** Funds are routed through a Channel Finance System (100+ partners like SCAs, PSBs, RRBs, NBFC-MFIs). Citizens lack awareness of specific credit schemes (Micro Finance up to ₹1.40L, Term Loan up to ₹50L, Education Loans) and struggle to find eligible Channel Partners.

## 2. Objective
Develop a mobile-first, multi-lingual Progressive Web App (PWA) that acts as an intelligent bridge between beneficiaries and channelizing agencies.

## 3. Core Features

### 3.1. Dashboard & User Profiling (Phase 1 Priority)
- **Auth:** Mobile Number OTP / Email signup.
- **Profiling:** Name, Gender, Age, Annual Income, Caste, Locality, Education Status, Project Type, Estimated Cost.
- **Dynamic Dashboard:** Showing 'Interested' (Saved) schemes, deadline alerts, and overall profile strength.

### 3.2. AI Personalized Scheme Recommendation
- **Smart Recommender:** AI/rule-based engine taking profile inputs and outputting multiple schemes.
- **Match Score:** Displays percentage match (e.g., 95% match, 75% match, 25% match).
- **Eligibility Gap Analysis:** Clear explanations: "Why Eligible" and "Why Not Eligible" (e.g., "Income exceeds limit for Scheme X").
- **Document Checklist & Readiness:** Auto-generates required documents for recommended schemes.
- **Deadline Tracking:** Tracks scheme deadlines with countdowns and push/email notifications.

### 3.3. Natural Language / Chat-Based Search
- AI Chatbot where users can type in natural language (e.g., "I need a loan of 5 lakhs for a dairy farm in UP") and get instant scheme matches.

### 3.4. Financial Calculator
- Dynamic tool for projected EMIs based on scheme guidelines, max limits, interest rates (6.5% - 15%), and moratorium periods (3 - 12 months).

### 3.5. Geo-Spatial Partner Locator & Router
- Maps integration to find the nearest eligible Channel Partner (SCA/Bank/NBFC-MFI).
- Filters partners based on current fund utilization (hides partners with high NPAs/overdues).

## 4. UI/UX Priorities
- **Mobile-First:** 100% optimized for mobile screens first, scaling up to tablets and desktops.
- **Multi-lingual:** Simple-language UI with one-tap translation (Hindi, English, regional languages).

## 5. System Notifications (via n8n)
- Send emails to users for "Interested" schemes.
- Send alerts for approaching scheme deadlines.
