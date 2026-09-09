-- Migration 001: Create schemes and partners tables
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- schemes table — source of truth for eligibility rules
-- Values from PRD.md section 6
-- ============================================================
CREATE TABLE IF NOT EXISTS schemes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  max_amount NUMERIC NOT NULL,
  interest_rate_min NUMERIC NOT NULL,
  interest_rate_max NUMERIC NOT NULL,
  moratorium_months_min INTEGER NOT NULL,
  moratorium_months_max INTEGER NOT NULL,
  eligibility_criteria JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================
-- partners table — channel partner directory
-- risk_score is SIMULATED (see PRD.md §2) — no real NPA data
-- ============================================================
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SCA', 'PSB', 'RRB', 'NBFC-MFI')),
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  contact_email TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  -- simulated: true means this data point is not sourced from a live system
  -- Production would pull from NBCFDC/SCA MIS — see PRD.md §2
  simulated BOOLEAN NOT NULL DEFAULT TRUE
);

-- Enable read access for the anon/publishable key (RLS)
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on schemes"
  ON schemes FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on partners"
  ON partners FOR SELECT
  USING (true);
