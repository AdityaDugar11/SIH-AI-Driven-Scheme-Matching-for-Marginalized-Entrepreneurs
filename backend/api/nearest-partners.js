const { getSupabase } = require('./_lib/supabase');

/**
 * Haversine distance between two lat/lng points in km.
 * Used for nearest-partner sorting — pure math, no external API.
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // round to 1 decimal
}

// Partners with risk_score above this are deprioritized (moved to end)
// but not hidden — the UI should still show them with a warning
const RISK_THRESHOLD = 70;

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
    const { lat, lng, scheme, limit = 3 } = req.body;

    // ── Input validation ──────────────────────────────────────
    const errors = [];
    if (lat === undefined || typeof lat !== 'number' || lat < -90 || lat > 90) {
      errors.push('lat must be a number between -90 and 90');
    }
    if (lng === undefined || typeof lng !== 'number' || lng < -180 || lng > 180) {
      errors.push('lng must be a number between -180 and 180');
    }
    if (limit !== undefined && (typeof limit !== 'number' || limit < 1 || limit > 50)) {
      errors.push('limit must be a number between 1 and 50');
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // ── Fetch all partners from database ──────────────────────
    const { data: partners, error: dbError } = await supabase
      .from('partners')
      .select('*');

    if (dbError) {
      console.error('Supabase error:', dbError);
      return res.status(500).json({ error: 'Database error fetching partners' });
    }

    if (!partners || partners.length === 0) {
      return res.status(200).json({ partners: [] });
    }

    // ── Calculate distance and sort ───────────────────────────
    const withDistance = partners.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      distance_km: haversineKm(lat, lng, Number(p.lat), Number(p.lng)),
      // risk_score is SIMULATED — not from real NPA data (see PRD.md §2)
      risk_score: p.risk_score,
      simulated: p.simulated, // always true in current dataset
      contact_email: p.contact_email
    }));

    // Sort: low-risk partners first within distance groups,
    // deprioritize high-risk partners (> threshold) to the end
    withDistance.sort((a, b) => {
      const aHighRisk = a.risk_score > RISK_THRESHOLD ? 1 : 0;
      const bHighRisk = b.risk_score > RISK_THRESHOLD ? 1 : 0;
      if (aHighRisk !== bHighRisk) return aHighRisk - bHighRisk;
      return a.distance_km - b.distance_km;
    });

    const result = withDistance.slice(0, limit);

    return res.status(200).json({ partners: result });
  } catch (err) {
    console.error('Unexpected error in /nearest-partners:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
