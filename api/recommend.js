const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { income, project_type, project_cost, education_need } = req.body;

    // ── Input validation ──────────────────────────────────────
    const errors = [];
    if (income === undefined || income === null || typeof income !== 'number' || income <= 0) {
      errors.push('income must be a positive number');
    }
    if (!project_type || typeof project_type !== 'string' || project_type.trim() === '') {
      errors.push('project_type is required and must be a non-empty string');
    }
    if (project_cost === undefined || project_cost === null || typeof project_cost !== 'number' || project_cost <= 0) {
      errors.push('project_cost must be a positive number');
    }
    if (education_need !== undefined && typeof education_need !== 'boolean') {
      errors.push('education_need must be a boolean');
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors, eligible: false });
    }

    const isEducation = education_need === true;
    const INCOME_THRESHOLD = 500000; // ₹5 Lakh — common to all schemes per PRD §6

    // ── Income check ──────────────────────────────────────────
    if (income > INCOME_THRESHOLD) {
      return res.status(200).json({
        recommended_scheme: null,
        reason: `Your annual income (₹${income.toLocaleString('en-IN')}) exceeds the ₹5,00,000 threshold for concessional lending schemes.`,
        alternates: [],
        eligible: false
      });
    }

    // ── Fetch schemes from database ───────────────────────────
    const { data: schemes, error: dbError } = await supabase
      .from('schemes')
      .select('*');

    if (dbError) {
      console.error('Supabase error:', dbError);
      return res.status(500).json({ error: 'Database error fetching schemes' });
    }

    // ── Deterministic eligibility matching ─────────────────────
    // This is a rules engine, NOT an ML model — see Rules.md rule 1
    const eligible = [];

    for (const scheme of schemes) {
      const criteria = scheme.eligibility_criteria;

      // Education need match
      if (isEducation && !criteria.education_need) continue;
      if (!isEducation && criteria.education_need) continue;

      // Project type match
      const validTypes = criteria.project_types || [];
      if (!validTypes.includes(project_type) && !isEducation) continue;
      if (isEducation && !validTypes.includes('education') && !validTypes.includes(project_type)) continue;

      // Project cost within scheme cap
      if (project_cost > Number(scheme.max_amount)) continue;

      eligible.push(scheme);
    }

    // ── No eligible scheme ────────────────────────────────────
    if (eligible.length === 0) {
      let reason = '';
      if (isEducation) {
        reason = `Your education cost (₹${project_cost.toLocaleString('en-IN')}) exceeds the available Education Loan Scheme cap, or no matching scheme was found.`;
      } else {
        reason = `Your project cost (₹${project_cost.toLocaleString('en-IN')}) exceeds the maximum for available ${project_type.replace(/_/g, ' ')} schemes.`;
      }
      return res.status(200).json({
        recommended_scheme: null,
        reason,
        alternates: [],
        eligible: false
      });
    }

    // ── Rank: most constrained (lowest max_amount) first ──────
    // This ensures Micro Finance is preferred over Term Loan for
    // small amounts, matching test cases 5 & 6 in Testing.md
    eligible.sort((a, b) => Number(a.max_amount) - Number(b.max_amount));

    const primary = eligible[0];
    const alternates = eligible.slice(1).map(s => s.name);

    // ── Build human-readable reason ───────────────────────────
    let reason = '';
    if (primary.name === 'Micro Finance Scheme') {
      reason = `Your project cost (₹${project_cost.toLocaleString('en-IN')}) is within the ₹1.40 Lakh limit and your income qualifies for concessional lending under the Micro Finance Scheme.`;
    } else if (primary.name === 'Term Loan Scheme') {
      reason = `Your project cost (₹${project_cost.toLocaleString('en-IN')}) qualifies for the Term Loan Scheme (up to ₹50 Lakh) for ${project_type.replace(/_/g, ' ')} projects at concessional rates.`;
    } else if (primary.name === 'Education Loan Scheme') {
      reason = `Your course cost (₹${project_cost.toLocaleString('en-IN')}) qualifies for the Education Loan Scheme at concessional interest rates of 6.5%–8%.`;
    }

    return res.status(200).json({
      recommended_scheme: primary.name,
      reason,
      alternates,
      eligible: true
    });
  } catch (err) {
    console.error('Unexpected error in /recommend:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
