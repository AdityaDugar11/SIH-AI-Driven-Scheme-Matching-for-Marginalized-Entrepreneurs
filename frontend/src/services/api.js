/**
 * API service for communicating with FastAPI backend endpoints:
 * - /recommend
 * - /calculate-emi
 * - /health
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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
