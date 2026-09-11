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
    const { email, scheme_name, match_score, eligible, reason, state, city, deadline_date } = req.body;

    if (!email || !scheme_name || match_score === undefined || eligible === undefined || !reason || !state || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('saved_recommendations')
      .insert([
        {
          email,
          scheme_name,
          match_score,
          eligible,
          reason,
          state,
          city,
          deadline_date: deadline_date || null
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error inserting saved recommendation:', error);
      return res.status(500).json({ error: 'Database error saving recommendation' });
    }

    return res.status(201).json({ success: true, saved_recommendation: data[0] });
  } catch (err) {
    console.error('Unexpected error in /save-recommendation:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
