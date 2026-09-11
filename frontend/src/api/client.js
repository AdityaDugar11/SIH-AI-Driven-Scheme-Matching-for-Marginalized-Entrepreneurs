/**
 * API Client — swappable mock/real fetch layer
 *
 * Toggle between mock and real backend via environment variables:
 *   VITE_USE_MOCK_API=true   → returns fixture data from mocks.js
 *   VITE_USE_MOCK_API=false  → calls real backend at VITE_API_BASE_URL
 *
 * Components import ONLY from this file — never from mocks.js directly.
 */

import { getMockRecommendation, getMockEmi, getMockNearestPartners, mockSaveRecommendation, mockGetDashboard, mockPatchInterest } from "./mocks.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/** Simulated network delay for mock mode (ms) */
const MOCK_DELAY_MS = 300;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /api/recommend
 * @param {{ income: number, project_type: string, project_cost: number, education_need: boolean }} data
 * @returns {Promise<{ matches: Array<{ scheme: string, match_score: number, eligible: boolean, reason: string, required_documents: string[] }> }>}
 */
export async function recommendScheme(data) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return getMockRecommendation(data);
  }

  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * POST /api/save-recommendation
 * @param {{ email: string, scheme_name: string, match_score: number, eligible: boolean, reason: string, state: string, city: string, deadline_date?: string }} data
 * @returns {Promise<{ success: boolean, saved_recommendation: any }>}
 */
export async function saveRecommendation(data) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return mockSaveRecommendation(data);
  }

  const res = await fetch(`${API_BASE}/api/save-recommendation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * GET /api/dashboard
 * @param {string} email
 * @returns {Promise<{ recommendations: Array<any> }>}
 */
export async function getDashboard(email) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return mockGetDashboard(email);
  }

  const res = await fetch(`${API_BASE}/api/dashboard?email=${encodeURIComponent(email)}`, {
    method: "GET"
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * PATCH /api/interest
 * @param {{ id: string, interested: boolean }} data
 * @returns {Promise<{ success: boolean, updated_recommendation: any }>}
 */
export async function patchInterest(data) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return mockPatchInterest(data);
  }

  const res = await fetch(`${API_BASE}/api/interest`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * POST /api/calculate-emi
 * @param {{ scheme: string, project_cost: number, tenure_months: number }} data
 * @returns {Promise<{ loan_amount: number, applicant_contribution: number, interest_rate: number, emi: number, moratorium_months: number, total_interest: number }>}
 */
export async function calculateEmi(data) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return getMockEmi(data);
  }

  const res = await fetch(`${API_BASE}/api/calculate-emi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * POST /api/nearest-partners
 * @param {{ lat: number, lng: number, scheme: string, limit: number }} data
 * @returns {Promise<{ partners: Array<{ id: string, name: string, type: string, distance_km: number, risk_score: number, simulated: boolean, contact_email: string, lat?: number, lng?: number }> }>}
 */
export async function nearestPartners(data) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return getMockNearestPartners(data);
  }

  const res = await fetch(`${API_BASE}/api/nearest-partners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}
