# UI Phases & Guidelines

## Platform Type: Progressive Web App (PWA)
We are building a **PWA**. It runs in the browser but can be installed on a mobile home screen like a native app. This solves the "website vs app" dilemma by being both.

## Priority: Mobile-First
All designs must be prototyped and built for Mobile screens first (max-width 480px). Tablet and Desktop are secondary.

## UI Phases

### Phase 1: Onboarding & Dashboard UI
- **Splash Screen:** Clean SIH/Gov branding.
- **Login/Signup:** Minimalist form.
- **Multi-step Profiling Wizard:**
  - Step 1: Basic (Name, Age, Gender).
  - Step 2: Socio-economic (Income, Caste, Locality).
  - Step 3: Requirements (Project Type, Cost).
  - Progress bar at the top.
- **Dashboard:**
  - Top: Profile Match Strength (Circular progress).
  - Middle: Filter chips (Central, State, Loan Type).
  - Main: Scheme Cards (Showing Match %).

### Phase 2: Scheme Details & Gap Analysis
- **Scheme Details Modal/Page:**
  - Large Match % indicator.
  - Tabs: Details, Gap Analysis, Documents.
  - "Why Eligible / Why Not Eligible" section with green checks and red crosses.
  - "Mark as Interested" button.

### Phase 3: Geo-Location & Maps
- **Map View:** Full-screen mobile map showing pins of nearby banks/NBFCs.
- Bottom sheet slides up with partner details and "Get Directions".

## Aesthetics
- **Framework:** Tailwind CSS.
- **Colors:** Trustworthy financial colors (Deep Blues, Greens for success/eligibility, clean Whites/Grays for background).
- **Typography:** Inter or Roboto (highly legible on low-end devices).
