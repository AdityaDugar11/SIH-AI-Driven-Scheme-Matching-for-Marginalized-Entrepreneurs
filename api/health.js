module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug: show which env vars are set (redacted values)
  const vars = {
    SUPABASE_URL: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'NOT SET',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (' + process.env.SUPABASE_ANON_KEY.substring(0, 15) + '...)' : 'NOT SET',
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ? 'SET (' + process.env.SUPABASE_PUBLISHABLE_KEY.substring(0, 15) + '...)' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 15) + '...)' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'SET (' + process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.substring(0, 15) + '...)' : 'NOT SET',
  };

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/recommend', '/api/calculate-emi', '/api/nearest-partners'],
    env_debug: vars
  });
};
