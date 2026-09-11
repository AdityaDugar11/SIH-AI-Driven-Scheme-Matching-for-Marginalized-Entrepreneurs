-- 1. Create the profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  age NUMERIC,
  gender TEXT,
  income NUMERIC,
  caste TEXT,
  locality TEXT,
  education TEXT,
  "projectType" TEXT,
  "estimatedCost" NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Turn on Row Level Security (RLS) for security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies so users can only view and edit their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);
