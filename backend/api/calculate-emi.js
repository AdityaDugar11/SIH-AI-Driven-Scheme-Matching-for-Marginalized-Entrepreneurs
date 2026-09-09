const { getSupabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error('Supabase init error:', err.message);
    return res.status(500).json({ error: 'Server configuration error', detail: err.message });
  }

  try {
    const { scheme, project_cost, tenure_months } = req.body;

    // ── Input validation ──────────────────────────────────────
    const errors = [];
    if (!scheme || typeof scheme !== 'string') {
      errors.push('scheme is required and must be a string');
    }
    if (project_cost === undefined || typeof project_cost !== 'number' || project_cost <= 0) {
      errors.push('project_cost must be a positive number');
    }
    if (tenure_months === undefined || typeof tenure_months !== 'number' || tenure_months <= 0 || !Number.isInteger(tenure_months)) {
      errors.push('tenure_months must be a positive integer');
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // ── Fetch scheme from database ────────────────────────────
    const { data: schemes, error: dbError } = await supabase
      .from('schemes')
      .select('*')
      .eq('name', scheme)
      .limit(1);

    if (dbError) {
      console.error('Supabase error:', dbError);
      return res.status(500).json({ error: 'Database error fetching scheme' });
    }

    if (!schemes || schemes.length === 0) {
      return res.status(404).json({ error: `Scheme "${scheme}" not found` });
    }

    const s = schemes[0];

    // ── Loan amount calculation ───────────────────────────────
    // Loan covers up to 90% of project/course cost, capped by scheme max
    // Remaining 10% is applicant contribution — PRD.md §6
    const maxLoan = Number(s.max_amount);
    const loanAmount = Math.min(Math.round(project_cost * 0.9), maxLoan);
    const applicantContribution = project_cost - loanAmount;

    // ── Interest rate ─────────────────────────────────────────
    // Use midpoint of scheme's rate range (rounded to 1 decimal)
    const rateMin = Number(s.interest_rate_min);
    const rateMax = Number(s.interest_rate_max);
    const annualRate = Math.round(((rateMin + rateMax) / 2) * 10) / 10;
    const monthlyRate = annualRate / 12 / 100;

    // ── EMI calculation ───────────────────────────────────────
    // Standard formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
    // where P = principal, r = monthly rate, n = tenure in months
    let emi;
    if (monthlyRate === 0) {
      emi = Math.round(loanAmount / tenure_months);
    } else {
      const factor = Math.pow(1 + monthlyRate, tenure_months);
      emi = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
    }

    // ── Total interest ────────────────────────────────────────
    const totalInterest = (emi * tenure_months) - loanAmount;

    // ── Moratorium ────────────────────────────────────────────
    // Use the lower end of the scheme's moratorium range
    const moratoriumMonths = Number(s.moratorium_months_min);

    return res.status(200).json({
      loan_amount: loanAmount,
      applicant_contribution: applicantContribution,
      interest_rate: annualRate,
      emi,
      moratorium_months: moratoriumMonths,
      total_interest: totalInterest
    });
  } catch (err) {
    console.error('Unexpected error in /calculate-emi:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
