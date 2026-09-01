/**
 * api.js
 * API service for communicating with FastAPI backend endpoints:
 * - /recommend
 * - /calculate-emi
 * - /nearest-partners
 * - /partners
 * - /ai/parse-query
 * - /health
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const INDIAN_CITIES = [
  { name: 'Delhi NCR', value: 'delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', value: 'mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', value: 'bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Lucknow', value: 'lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Chennai', value: 'chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', value: 'kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', value: 'hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Jaipur', value: 'jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Patna', value: 'patna', lat: 25.6110, lng: 85.1270 },
  { name: 'Ahmedabad', value: 'ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Bhopal', value: 'bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Guwahati', value: 'guwahati', lat: 26.1445, lng: 91.7362 },
];

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'healthy';
  } catch (err) {
    return false;
  }
}

/**
 * Recommend concessional loan scheme based on applicant profile
 */
export async function fetchSchemeRecommendation({
  income,
  project_type,
  project_cost,
  education_need,
  gender,
}) {
  const payload = {
    income: parseFloat(income) || 0,
    project_type: project_type || 'small_business',
    project_cost: parseFloat(project_cost) || 0,
    education_need: Boolean(education_need),
    gender: gender || null,
  };

  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to fetch recommendation from backend.';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return await response.json();
}

/**
 * Calculate EMI and financial breakdown for a scheme
 */
export async function fetchEmiCalculation({
  scheme,
  project_cost,
  tenure_months,
  moratorium_months,
  gender,
}) {
  const payload = {
    scheme: scheme || 'Micro Finance Scheme',
    project_cost: parseFloat(project_cost) || 0,
    tenure_months: parseInt(tenure_months, 10) || 36,
    moratorium_months: moratorium_months ? parseInt(moratorium_months, 10) : null,
    gender: gender || null,
  };

  const response = await fetch(`${API_BASE_URL}/calculate-emi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to calculate EMI from backend.';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return await response.json();
}

/**
 * Fetch nearest channel partners ranked by Haversine distance and risk score
 */
export async function fetchNearestPartners({
  lat,
  lng,
  scheme = 'Micro Finance Scheme',
  limit = 5,
  max_risk_score = null,
}) {
  const payload = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    scheme: scheme || 'Micro Finance Scheme',
    limit: parseInt(limit, 10) || 5,
    max_risk_score: max_risk_score ? parseInt(max_risk_score, 10) : null,
  };

  const response = await fetch(`${API_BASE_URL}/nearest-partners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to find nearest partners.';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return await response.json();
}

/**
 * Natural language conversational query parsing into structured parameters
 */
export async function parseAiQuery(query) {
  const response = await fetch(`${API_BASE_URL}/ai/parse-query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to parse query.';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return await response.json();
}

/**
 * Fetch full channel partner directory
 */
export async function fetchAllPartners(city = null) {
  const url = city ? `${API_BASE_URL}/partners?city=${encodeURIComponent(city)}` : `${API_BASE_URL}/partners`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to load partners list.');
  }

  return await response.json();
}
