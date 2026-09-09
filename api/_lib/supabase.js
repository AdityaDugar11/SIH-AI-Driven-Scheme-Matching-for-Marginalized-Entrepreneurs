const { createClient } = require('@supabase/supabase-js');

/**
 * Create a Supabase client lazily inside each request handler.
 * Tries multiple env var names since Vercel's Supabase integration
 * may set them under different names than what we expect.
 */
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
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
