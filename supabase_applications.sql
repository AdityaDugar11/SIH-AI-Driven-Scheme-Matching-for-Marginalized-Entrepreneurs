-- Create applications table to persist user applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  scheme_id INT NOT NULL,
  scheme_name TEXT NOT NULL,
  status TEXT DEFAULT 'APPLIED' NOT NULL,
  requested_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only view and edit their own applications
CREATE POLICY "Users can insert their own applications" 
ON applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own applications" 
ON applications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" 
ON applications FOR UPDATE 
USING (auth.uid() = user_id);
