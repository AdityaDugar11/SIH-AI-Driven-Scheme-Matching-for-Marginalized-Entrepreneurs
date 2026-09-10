/**
 * Mock API fixtures — SIMULATED DATA
 * Response shapes match TECH_STACK.md API contract exactly.
 * Used when VITE_USE_MOCK_API=true (offline development / backend not ready).
 *
 * DO NOT import this file in components — only client.js reads it.
 */

// MOCK DATA — simulated fixture for POST /recommend (eligible case)
export const MOCK_RECOMMEND_ELIGIBLE = {
  recommended_scheme: "Micro Finance Scheme",
  reason:
    "Your project cost is within the ₹1.40 Lakh limit and your income qualifies for concessional lending.",
  alternates: ["Term Loan Scheme"],
  eligible: true,
};

// MOCK DATA — simulated fixture for POST /recommend (ineligible: income too high)
export const MOCK_RECOMMEND_INELIGIBLE = {
  recommended_scheme: null,
  reason:
    "Your annual income (₹6,00,000) exceeds the ₹5,00,000 threshold for concessional lending schemes.",
  alternates: [],
  eligible: false,
};

// MOCK DATA — simulated fixture for POST /recommend (education)
export const MOCK_RECOMMEND_EDUCATION = {
  recommended_scheme: "Education Loan Scheme",
  reason:
    "Your course cost qualifies for the Education Loan Scheme at concessional interest rates of 6.5%–8%.",
  alternates: [],
  eligible: true,
};

// MOCK DATA — simulated fixture for POST /calculate-emi
export const MOCK_CALCULATE_EMI = {
  loan_amount: 108000,
  applicant_contribution: 12000,
  interest_rate: 7.0,
  emi: 3340,
  moratorium_months: 3,
  total_interest: 12240,
};

/**
 * Returns the appropriate mock response for /recommend based on input.
 * Simulates the deterministic rules engine logic for offline dev.
 */
export function getMockRecommendation(data) {
  if (data.income > 500000) {
    return {
      ...MOCK_RECOMMEND_INELIGIBLE,
      reason: `Your annual income (₹${data.income.toLocaleString("en-IN")}) exceeds the ₹5,00,000 threshold for concessional lending schemes.`,
    };
  }
  if (data.education_need) {
    return MOCK_RECOMMEND_EDUCATION;
  }
  if (data.project_cost > 140000) {
    return {
      recommended_scheme: "Term Loan Scheme",
      reason: `Your project cost (₹${data.project_cost.toLocaleString("en-IN")}) qualifies for the Term Loan Scheme (up to ₹50 Lakh) at concessional rates.`,
      alternates: [],
      eligible: true,
    };
  }
  return MOCK_RECOMMEND_ELIGIBLE;
}

/**
 * Returns mock EMI calculation.
 * Uses a simplified formula matching the real backend's approach.
 */
export function getMockEmi(data) {
  const loanAmount = Math.min(Math.round(data.project_cost * 0.9), 140000);
  const contribution = data.project_cost - loanAmount;
  const annualRate = 7.0;
  const monthlyRate = annualRate / 12 / 100;
  const n = data.tenure_months;
  const factor = Math.pow(1 + monthlyRate, n);
  const emi = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
  const totalInterest = emi * n - loanAmount;

  return {
    loan_amount: loanAmount,
    applicant_contribution: contribution,
    interest_rate: annualRate,
    emi,
    moratorium_months: 3,
    total_interest: totalInterest,
  };
}
