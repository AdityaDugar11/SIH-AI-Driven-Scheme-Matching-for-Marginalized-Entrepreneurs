-- Seed data for schemes and partners tables
-- Run this in Supabase SQL Editor AFTER 001_create_tables.sql
-- Data matches data/schemes.json and data/partners.json in the repo

-- ============================================================
-- Schemes — from PRD.md section 6
-- ============================================================
INSERT INTO schemes (id, name, max_amount, interest_rate_min, interest_rate_max, moratorium_months_min, moratorium_months_max, eligibility_criteria, required_documents)
VALUES
  (1, 'Micro Finance Scheme', 140000, 6.5, 8.0, 3, 6,
   '{"max_income": 500000, "project_types": ["small_business"], "education_need": false}',
   '{"Aadhaar Card", "Income Certificate", "Caste Certificate", "Project Proposal", "Bank Passbook"}'),
  (2, 'Term Loan Scheme', 5000000, 8.0, 10.0, 6, 12,
   '{"max_income": 500000, "project_types": ["small_business", "larger_project", "manufacturing", "trade", "service"], "education_need": false}',
   '{"Aadhaar Card", "Income Certificate", "Caste Certificate", "Detailed Project Report", "Bank Passbook"}'),
  (3, 'Education Loan Scheme', 2000000, 6.5, 8.0, 6, 12,
   '{"max_income": 500000, "project_types": ["education"], "education_need": true}',
   '{"Aadhaar Card", "Income Certificate", "Caste Certificate", "Admission Letter", "Fee Structure", "Bank Passbook"}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Partners — 30 channel partner branches
-- risk_score is SIMULATED — not from a real NPA/MIS source
-- Production would integrate with NBCFDC/SCA MIS (see PRD.md §2)
-- ============================================================
INSERT INTO partners (id, name, type, lat, lng, contact_email, risk_score, simulated)
VALUES
  ('P001', 'State Bank of India — Connaught Place Branch', 'PSB', 28.6315, 77.2167, 'cp.branch@sbi.co.in', 18, true),
  ('P002', 'Punjab National Bank — Karol Bagh Branch', 'PSB', 28.6519, 77.1907, 'karolbagh@pnb.co.in', 25, true),
  ('P003', 'Bank of Baroda — Fort Branch Mumbai', 'PSB', 18.9340, 72.8356, 'fort.mumbai@bankofbaroda.co.in', 15, true),
  ('P004', 'Canara Bank — MG Road Bangalore', 'PSB', 12.9756, 77.6066, 'mgroad.blr@canarabank.com', 20, true),
  ('P005', 'Union Bank of India — Anna Salai Chennai', 'PSB', 13.0604, 80.2496, 'annasalai@unionbankofindia.co.in', 22, true),
  ('P006', 'Indian Bank — Abids Hyderabad', 'PSB', 17.3927, 78.4753, 'abids.hyd@indianbank.co.in', 28, true),
  ('P007', 'Central Bank of India — BBD Bagh Kolkata', 'PSB', 22.5726, 88.3510, 'bbdbagh.kol@centralbankofindia.co.in', 32, true),
  ('P008', 'Bank of India — CG Road Ahmedabad', 'PSB', 23.0300, 72.5660, 'cgroad.ahm@bankofindia.co.in', 19, true),
  ('P009', 'Uttar Bihar Gramin Bank — Patna Main', 'RRB', 25.6120, 85.1440, 'patna.main@ubgb.in', 42, true),
  ('P010', 'Baroda UP Gramin Bank — Lucknow Branch', 'RRB', 26.8500, 80.9460, 'lucknow@barodaupbank.in', 38, true),
  ('P011', 'Karnataka Gramin Bank — Dharwad Branch', 'RRB', 15.4589, 75.0078, 'dharwad@karnatakagraminbank.com', 35, true),
  ('P012', 'Andhra Pradesh Grameena Vikas Bank — Warangal', 'RRB', 17.9784, 79.5941, 'warangal@apgvbank.in', 40, true),
  ('P013', 'Madhyanchal Gramin Bank — Bhopal Branch', 'RRB', 23.2599, 77.4126, 'bhopal@mgbank.in', 45, true),
  ('P014', 'Rajasthan Marudhara Gramin Bank — Jaipur', 'RRB', 26.9124, 75.7873, 'jaipur@rmgb.in', 22, true),
  ('P015', 'Telangana Grameena Bank — Hyderabad Branch', 'RRB', 17.4000, 78.4800, 'hyderabad@tgbank.in', 30, true),
  ('P016', 'Kerala Gramin Bank — Ernakulam Branch', 'RRB', 9.9816, 76.2999, 'ernakulam@keralagbank.in', 16, true),
  ('P017', 'NSFDC — Head Office Delhi', 'SCA', 28.6271, 77.2219, 'info@nsfdc.nic.in', 12, true),
  ('P018', 'Tamil Nadu Adi Dravidar Housing & Dev Corporation — Chennai', 'SCA', 13.0878, 80.2785, 'tahdco.chennai@tn.gov.in', 24, true),
  ('P019', 'UP SC Finance & Development Corporation — Lucknow', 'SCA', 26.8489, 80.9340, 'upscfdc@up.gov.in', 48, true),
  ('P020', 'Maharashtra Mahatma Phule BC Dev Corporation — Mumbai', 'SCA', 19.0760, 72.8777, 'mpbcdc@maharashtra.gov.in', 30, true),
  ('P021', 'MP SC Finance & Development Corporation — Bhopal', 'SCA', 23.2650, 77.4100, 'mpscfdc@mp.gov.in', 55, true),
  ('P022', 'Dr. BR Ambedkar Dev Corporation — Bangalore', 'SCA', 12.9800, 77.5900, 'ambedkarcorp@karnataka.gov.in', 26, true),
  ('P023', 'Bihar SC/ST Development Corporation — Patna', 'SCA', 25.6100, 85.1300, 'bscstdc@bihar.gov.in', 60, true),
  ('P024', 'Rajasthan SC/ST Finance & Dev Corporation — Jaipur', 'SCA', 26.9200, 75.7900, 'rscstfdc@rajasthan.gov.in', 33, true),
  ('P025', 'Bandhan Bank — Salt Lake Kolkata', 'NBFC-MFI', 22.5800, 88.4100, 'saltlake.kol@bandhanbank.com', 20, true),
  ('P026', 'Bharat Financial Inclusion — Begumpet Hyderabad', 'NBFC-MFI', 17.4400, 78.4700, 'begumpet@bharatfinancial.in', 35, true),
  ('P027', 'Cashpor Micro Credit — Varanasi Branch', 'NBFC-MFI', 25.3176, 82.9739, 'varanasi@cashpor.in', 44, true),
  ('P028', 'ESAF Small Finance Bank — Thrissur Branch', 'NBFC-MFI', 10.5276, 76.2144, 'thrissur@esafbank.com', 17, true),
  ('P029', 'Ujjivan Small Finance Bank — Koramangala Bangalore', 'NBFC-MFI', 12.9352, 77.6245, 'koramangala.blr@ujjivan.com', 21, true),
  ('P030', 'Arohan Financial Services — Park Street Kolkata', 'NBFC-MFI', 22.5530, 88.3510, 'parkstreet.kol@arohan.in', 38, true)
ON CONFLICT (id) DO NOTHING;
