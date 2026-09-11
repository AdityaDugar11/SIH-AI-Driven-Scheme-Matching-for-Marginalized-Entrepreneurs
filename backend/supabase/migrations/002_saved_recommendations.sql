-- Migration 002: Create saved_recommendations and add required_documents to schemes

-- 1. Add required_documents array to schemes table
ALTER TABLE schemes 
ADD COLUMN IF NOT EXISTS required_documents TEXT[] DEFAULT '{}';

-- 2. Create saved_recommendations table
CREATE TABLE IF NOT EXISTS saved_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  scheme_name TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  eligible BOOLEAN NOT NULL,
  reason TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  interested BOOLEAN DEFAULT NULL,
  deadline_date DATE DEFAULT NULL,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on the new table
ALTER TABLE saved_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow public access for now since there's no auth, based on email.
-- For production, this would be restricted. But for this hackathon:
CREATE POLICY "Allow public insert on saved_recommendations"
  ON saved_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select on saved_recommendations"
  ON saved_recommendations FOR SELECT
  USING (true);

CREATE POLICY "Allow public update on saved_recommendations"
  ON saved_recommendations FOR UPDATE
  USING (true);
