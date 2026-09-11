/**
 * Mock API fixtures — SIMULATED DATA
 * Response shapes match TECH_STACK.md API contract exactly.
 * Used when VITE_USE_MOCK_API=true (offline development / backend not ready).
 *
 * DO NOT import this file in components — only client.js reads it.
 */

// MOCK DATA — simulated fixture for POST /recommend (eligible case)
export const MOCK_RECOMMEND_ELIGIBLE = {
  matches: [
    {
      scheme: "Micro Finance Scheme",
      match_score: 100,
      eligible: true,
      reason: "Your project cost is within the ₹1.40 Lakh limit and your income qualifies for concessional lending.",
      required_documents: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Project Proposal", "Bank Passbook"]
    },
    {
      scheme: "Term Loan Scheme",
      match_score: 67,
      eligible: false,
      reason: "Your project cost (₹1,20,000) exceeds the maximum allowed for this scheme.",
      required_documents: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Detailed Project Report", "Bank Passbook"]
    }
  ]
};

// MOCK DATA — simulated fixture for POST /recommend (ineligible: income too high)
export const MOCK_RECOMMEND_INELIGIBLE = {
  matches: [
    {
      scheme: "Micro Finance Scheme",
      match_score: 33,
      eligible: false,
      reason: "Your annual income exceeds the ₹5,00,000 threshold for concessional lending schemes.",
      required_documents: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Project Proposal", "Bank Passbook"]
    }
  ]
};

// MOCK DATA — simulated fixture for POST /recommend (education)
export const MOCK_RECOMMEND_EDUCATION = {
  matches: [
    {
      scheme: "Education Loan Scheme",
      match_score: 100,
      eligible: true,
      reason: "Your course cost qualifies for the Education Loan Scheme at concessional interest rates of 6.5%–8%.",
      required_documents: ["Aadhaar Card", "Income Certificate", "Admission Letter", "Fee Structure"]
    }
  ]
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

// MOCK DATA — simulated fixture for POST /nearest-partners
export const MOCK_NEAREST_PARTNERS = {
  partners: [
    {
      id: "P014",
      name: "XYZ RRB Branch",
      type: "RRB",
      distance_km: 3.2,
      risk_score: 22,
      simulated: true,
      contact_email: "branch@xyzrrb.in",
      lat: 28.615,
      lng: 77.215
    },
    {
      id: "P025",
      name: "National SC Finance Corp",
      type: "SCA",
      distance_km: 5.1,
      risk_score: 15,
      simulated: true,
      contact_email: "contact@nsfdc.in",
      lat: 28.600,
      lng: 77.225
    },
    {
      id: "P102",
      name: "City Bank Microfinance",
      type: "PSB",
      distance_km: 7.8,
      risk_score: 45,
      simulated: true,
      contact_email: "loans@citybank.in",
      lat: 28.630,
      lng: 77.200
    }
  ]
};

/**
 * Returns the appropriate mock response for /recommend based on input.
 * Simulates the deterministic rules engine logic for offline dev.
 */
export function getMockRecommendation(data) {
  if (data.income > 500000) {
    const res = JSON.parse(JSON.stringify(MOCK_RECOMMEND_INELIGIBLE));
    res.matches[0].reason = `Your annual income (₹${data.income.toLocaleString("en-IN")}) exceeds the ₹5,00,000 threshold for concessional lending schemes.`;
    return res;
  }
  if (data.education_need) {
    return MOCK_RECOMMEND_EDUCATION;
  }
  if (data.project_cost > 140000) {
    return {
      matches: [
        {
          scheme: "Term Loan Scheme",
          match_score: 100,
          eligible: true,
          reason: `Your project cost (₹${data.project_cost.toLocaleString("en-IN")}) qualifies for the Term Loan Scheme (up to ₹50 Lakh) at concessional rates.`,
          required_documents: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Detailed Project Report", "Bank Passbook"]
        }
      ]
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

/**
 * Returns mock nearest partners based on location.
 */
export function getMockNearestPartners(data) {
  const limit = data.limit || 3;
  return {
    partners: MOCK_NEAREST_PARTNERS.partners.slice(0, limit)
  };
}

// Memory store for mock dashboard
let mockSavedRecommendations = [];

export function mockSaveRecommendation(data) {
  const newRec = {
    id: "mock-" + Date.now() + Math.random().toString(36).substr(2, 5),
    ...data,
    interested: null,
    reminder_sent: false,
    created_at: new Date().toISOString()
  };
  mockSavedRecommendations.push(newRec);
  return { success: true, saved_recommendation: newRec };
}

export function mockGetDashboard(email) {
  return {
    recommendations: mockSavedRecommendations.filter(r => r.email === email)
  };
}

export function mockPatchInterest(data) {
  const rec = mockSavedRecommendations.find(r => r.id === data.id);
  if (rec) {
    rec.interested = data.interested;
    return { success: true, updated_recommendation: rec };
  }
  throw new Error("Recommendation not found");
}
