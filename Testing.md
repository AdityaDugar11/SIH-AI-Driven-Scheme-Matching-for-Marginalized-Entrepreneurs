# Testing Strategy

## 1. Unit Testing
- Test core AI Matching logic (e.g., ensuring a user with 6L income is NOT matched to a scheme with a 5L limit).
- Tool: Jest.

## 2. Component Testing
- Test Dashboard rendering, Filter interactions, and gap analysis displays.
- Tool: React Testing Library.

## 3. End-to-End (E2E) Testing
- Simulate a full user journey: Signup -> Profiling -> Viewing Matches -> Clicking "Interested".
- Tool: Cypress or Playwright.

## 4. Automation Testing
- Ensure n8n webhooks correctly parse payloads and trigger mock emails.
