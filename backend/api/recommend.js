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
    const matches = [];

    for (const scheme of schemes) {
      const criteria = scheme.eligibility_criteria || {};
      let score = 0;
      let totalCriteria = 3; // Income, project type, max amount

      // 1. Income check
      // Assuming all schemes have a max_income of 500000 for now per PRD
      const maxIncome = criteria.max_income || 500000;
      if (income <= maxIncome) {
        score++;
      }

      // 2. Project type check
      let typeMatch = false;
      const validTypes = criteria.project_types || [];
      if (isEducation) {
        if (criteria.education_need || validTypes.includes('education') || validTypes.includes(project_type)) {
          typeMatch = true;
        }
      } else {
        if (!criteria.education_need && (validTypes.includes(project_type) || validTypes.length === 0)) {
          typeMatch = true;
        }
      }
      if (typeMatch) score++;

      // 3. Project cost check
      let costMatch = false;
      if (project_cost <= Number(scheme.max_amount)) {
        costMatch = true;
        score++;
      }
      
      const match_score = Math.round((score / totalCriteria) * 100);
      const eligible = (match_score === 100);

      let reason = '';
      if (eligible) {
        if (scheme.name === 'Micro Finance Scheme') {
          reason = `Your project cost (₹${project_cost.toLocaleString('en-IN')}) is within the ₹1.40 Lakh limit and your income qualifies for concessional lending under the Micro Finance Scheme.`;
        } else if (scheme.name === 'Term Loan Scheme') {
          reason = `Your project cost (₹${project_cost.toLocaleString('en-IN')}) qualifies for the Term Loan Scheme (up to ₹50 Lakh) for ${project_type.replace(/_/g, ' ')} projects at concessional rates.`;
        } else if (scheme.name === 'Education Loan Scheme') {
          reason = `Your course cost (₹${project_cost.toLocaleString('en-IN')}) qualifies for the Education Loan Scheme at concessional interest rates of 6.5%–8%.`;
        } else {
          reason = `You meet all criteria for this scheme.`;
        }
      } else {
        if (income > maxIncome) {
          reason = `Your annual income (₹${income.toLocaleString('en-IN')}) exceeds the ₹5,00,000 threshold.`;
        } else if (!typeMatch) {
          reason = `This scheme is not suitable for your project type.`;
        } else if (!costMatch) {
          reason = `Your project cost (₹${project_cost.toLocaleString('en-IN')}) exceeds the maximum allowed for this scheme.`;
        } else {
          reason = `You do not meet all criteria for this scheme.`;
        }
      }

      matches.push({
        scheme: scheme.name,
        match_score,
        eligible,
        reason,
        required_documents: scheme.required_documents || []
      });
    }

    // Sort by match_score descending. If scores are equal, sort by max_amount ascending (most constrained first).
    matches.sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score;
      }
      const aScheme = schemes.find(s => s.name === a.scheme);
      const bScheme = schemes.find(s => s.name === b.scheme);
      return Number(aScheme.max_amount) - Number(bScheme.max_amount);
    });

    return res.status(200).json({
      matches
    });
  } catch (err) {
    console.error('Unexpected error in /recommend:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
