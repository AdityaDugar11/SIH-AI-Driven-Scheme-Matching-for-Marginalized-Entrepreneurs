/**
 * Test script for backend API endpoints.
 * Tests all 10 recommender cases from Testing.md, plus EMI and partner tests.
 *
 * Usage:
 *   BASE_URL=https://your-app.vercel.app node scripts/test-endpoints.js
 *   (defaults to http://localhost:3000 if BASE_URL not set)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { status: res.status, data: await res.json() };
}

let passed = 0;
let failed = 0;

function assert(testName, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ ${testName} — ${detail}`);
    failed++;
  }
}

async function testRecommender() {
  console.log('\n── Recommender Tests (Testing.md §1) ──\n');

  // Test 1: income 4L, small_business, cost 1L → Micro Finance
  let r = await post('recommend', { income: 400000, project_type: 'small_business', project_cost: 100000, education_need: false });
  assert('T1: Micro Finance for small biz ₹1L', r.data.recommended_scheme === 'Micro Finance Scheme' && r.data.eligible === true,
    `got: ${r.data.recommended_scheme}, eligible: ${r.data.eligible}`);

  // Test 2: income 3L, larger_project, cost 20L → Term Loan
  r = await post('recommend', { income: 300000, project_type: 'larger_project', project_cost: 2000000, education_need: false });
  assert('T2: Term Loan for larger project ₹20L', r.data.recommended_scheme === 'Term Loan Scheme' && r.data.eligible === true,
    `got: ${r.data.recommended_scheme}`);

  // Test 3: income 2L, education, cost 8L → Education Loan
  r = await post('recommend', { income: 200000, project_type: 'education', project_cost: 800000, education_need: true });
  assert('T3: Education Loan ₹8L', r.data.recommended_scheme === 'Education Loan Scheme' && r.data.eligible === true,
    `got: ${r.data.recommended_scheme}`);

  // Test 4: income 6L → not eligible
  r = await post('recommend', { income: 600000, project_type: 'small_business', project_cost: 100000, education_need: false });
  assert('T4: Income ₹6L → not eligible', r.data.eligible === false,
    `eligible: ${r.data.eligible}`);

  // Test 5: cost exactly 1.4L → Micro Finance (boundary)
  r = await post('recommend', { income: 400000, project_type: 'small_business', project_cost: 140000, education_need: false });
  assert('T5: Boundary ₹1.4L → Micro Finance', r.data.recommended_scheme === 'Micro Finance Scheme' && r.data.eligible === true,
    `got: ${r.data.recommended_scheme}`);

  // Test 6: cost 1.40001L → Term Loan (just over Micro cap)
  r = await post('recommend', { income: 400000, project_type: 'small_business', project_cost: 140001, education_need: false });
  assert('T6: ₹1.40001L → Term Loan fallback', r.data.recommended_scheme === 'Term Loan Scheme' && r.data.eligible === true,
    `got: ${r.data.recommended_scheme}`);

  // Test 7: larger_project cost 50L → Term Loan (boundary)
  r = await post('recommend', { income: 400000, project_type: 'larger_project', project_cost: 5000000, education_need: false });
  assert('T7: Boundary ₹50L → Term Loan', r.data.recommended_scheme === 'Term Loan Scheme' && r.data.eligible === true,
    `got: ${r.data.recommended_scheme}`);

  // Test 8: cost 50.00001L → not eligible
  r = await post('recommend', { income: 400000, project_type: 'larger_project', project_cost: 5000001, education_need: false });
  assert('T8: ₹50.00001L → not eligible', r.data.eligible === false,
    `eligible: ${r.data.eligible}`);

  // Test 9: income 0 or negative → validation error
  r = await post('recommend', { income: -1, project_type: 'small_business', project_cost: 100000, education_need: false });
  assert('T9: Negative income → 400 error', r.status === 400,
    `status: ${r.status}`);

  // Test 10: missing project_type → validation error
  r = await post('recommend', { income: 400000, project_cost: 100000, education_need: false });
  assert('T10: Missing project_type → 400 error', r.status === 400,
    `status: ${r.status}`);
}

async function testCalculator() {
  console.log('\n── Calculator Tests (Testing.md §2) ──\n');

  // Test 1: Micro Finance, ₹1L, 36mo → loan = ₹90,000
  let r = await post('calculate-emi', { scheme: 'Micro Finance Scheme', project_cost: 100000, tenure_months: 36 });
  assert('C1: Loan = 90% of cost', r.data.loan_amount === 90000 && r.data.applicant_contribution === 10000,
    `loan: ${r.data.loan_amount}, contrib: ${r.data.applicant_contribution}`);

  // Test 2: Term Loan, ₹20L, 60mo → correct rate + EMI
  r = await post('calculate-emi', { scheme: 'Term Loan Scheme', project_cost: 2000000, tenure_months: 60 });
  assert('C2: Term Loan rate in range', r.data.interest_rate >= 8 && r.data.interest_rate <= 10 && r.data.emi > 0,
    `rate: ${r.data.interest_rate}, emi: ${r.data.emi}`);

  // Test 3: Education Loan, ₹8L, 84mo → moratorium applied
  r = await post('calculate-emi', { scheme: 'Education Loan Scheme', project_cost: 800000, tenure_months: 84 });
  assert('C3: Education moratorium ≥ 6', r.data.moratorium_months >= 6,
    `moratorium: ${r.data.moratorium_months}`);

  // Test 4: cost = 0 → validation error
  r = await post('calculate-emi', { scheme: 'Micro Finance Scheme', project_cost: 0, tenure_months: 36 });
  assert('C4: Zero cost → 400 error', r.status === 400,
    `status: ${r.status}`);

  // Test 5: tenure = 0 → validation error
  r = await post('calculate-emi', { scheme: 'Micro Finance Scheme', project_cost: 100000, tenure_months: 0 });
  assert('C5: Zero tenure → 400 error', r.status === 400,
    `status: ${r.status}`);
}

async function testLocator() {
  console.log('\n── Locator Tests (Testing.md §3) ──\n');

  // Delhi location — should find Delhi partners as nearest
  let r = await post('nearest-partners', { lat: 28.61, lng: 77.21, limit: 3 });
  assert('L1: Returns 3 partners', r.data.partners && r.data.partners.length === 3,
    `count: ${r.data.partners?.length}`);
  assert('L2: Sorted by distance', r.data.partners[0].distance_km <= r.data.partners[1].distance_km,
    `d0: ${r.data.partners?.[0]?.distance_km}, d1: ${r.data.partners?.[1]?.distance_km}`);
  assert('L3: Has simulated flag', r.data.partners[0].simulated === true,
    `simulated: ${r.data.partners?.[0]?.simulated}`);

  // Remote location — should still return partners
  r = await post('nearest-partners', { lat: 0.0, lng: 0.0, limit: 1 });
  assert('L4: Remote location returns partner', r.data.partners && r.data.partners.length === 1,
    `count: ${r.data.partners?.length}`);
}

async function run() {
  console.log(`\nTesting against: ${BASE_URL}\n`);
  try {
    await testRecommender();
    await testCalculator();
    await testLocator();
  } catch (err) {
    console.error('\n💥 Test runner error:', err.message);
  }
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════════\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
