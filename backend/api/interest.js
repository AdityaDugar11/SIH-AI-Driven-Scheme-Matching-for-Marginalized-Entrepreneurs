const { getSupabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed. Use PATCH.' });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error('Supabase init error:', err.message);
    return res.status(500).json({ error: 'Server configuration error', detail: err.message });
  }

  try {
    const { id, interested } = req.body;

    if (!id || interested === undefined) {
      return res.status(400).json({ error: 'id and interested fields are required' });
    }

    const { data, error } = await supabase
      .from('saved_recommendations')
      .update({ interested })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error updating interest:', error);
      return res.status(500).json({ error: 'Database error updating interest' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    return res.status(200).json({ success: true, updated_recommendation: data[0] });
  } catch (err) {
    console.error('Unexpected error in /interest:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
