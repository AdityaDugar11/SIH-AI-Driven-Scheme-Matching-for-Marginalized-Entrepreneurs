const { createClient } = require('@supabase/supabase-js');

/**
 * Create a Supabase client lazily inside each request handler.
 * Tries multiple env var names since Vercel's Supabase integration
 * may set them under different names than what we expect.
 */
function getSupabase() {
  // Try multiple env var names — Vercel's Supabase integration sets
  // NEXT_PUBLIC_* variants; manual setup uses SUPABASE_URL/SUPABASE_ANON_KEY.
  // Prefer NEXT_PUBLIC_ first since Vercel integration sets them reliably.
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL
  ];
  const url = candidates.find(u => u && u.startsWith('https://'));

  const key = process.env.SUPABASE_ANON_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      `Missing Supabase env vars. SUPABASE_URL=${url ? 'set' : 'MISSING'}, ` +
      `SUPABASE_ANON_KEY=${key ? 'set' : 'MISSING'}`
    );
  }

  return createClient(url, key);
}

module.exports = { getSupabase };
