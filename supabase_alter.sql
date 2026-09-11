-- Run this script in your Supabase SQL Editor to add the new fields

ALTER TABLE profiles
ADD COLUMN state TEXT,
ADD COLUMN city TEXT,
ADD COLUMN area_of_residence TEXT,
ADD COLUMN is_pvtg BOOLEAN DEFAULT false,
ADD COLUMN is_dnt BOOLEAN DEFAULT false,
ADD COLUMN has_disability BOOLEAN DEFAULT false,
ADD COLUMN is_minority BOOLEAN DEFAULT false,
ADD COLUMN is_student BOOLEAN DEFAULT false,
ADD COLUMN is_bpl BOOLEAN DEFAULT false,
ADD COLUMN parent_income NUMERIC;
