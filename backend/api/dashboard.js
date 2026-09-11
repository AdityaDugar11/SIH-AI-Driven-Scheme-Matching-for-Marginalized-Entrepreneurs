const { getSupabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error('Supabase init error:', err.message);
    return res.status(500).json({ error: 'Server configuration error', detail: err.message });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'email query parameter is required' });
    }

    const { data, error } = await supabase
      .from('saved_recommendations')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching dashboard:', error);
      return res.status(500).json({ error: 'Database error fetching dashboard' });
    }

    return res.status(200).json({ recommendations: data });
  } catch (err) {
    console.error('Unexpected error in /dashboard:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
