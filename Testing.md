# Testing.md

No formal test framework required given the timeline — a checklist run manually (or a plain script printing pass/fail) is sufficient. Do not spend hackathon hours setting up Jest/pytest infrastructure unless someone already has boilerplate ready.

## 1. Recommender test cases
Run each through `/recommend` and verify against PRD.md §6:

| # | Income | Project type | Cost | Expected scheme | Expected eligible |
|---|---|---|---|---|---|
| 1 | ₹4,00,000 | small_business | ₹1,00,000 | Micro Finance Scheme | true |
| 2 | ₹3,00,000 | larger_project | ₹20,00,000 | Term Loan Scheme | true |
| 3 | ₹2,00,000 | education | ₹8,00,000 | Education Loan Scheme | true |
| 4 | ₹6,00,000 | small_business | ₹1,00,000 | — | false (income over threshold) |
| 5 | ₹4,00,000 | small_business | ₹1,40,000 | Micro Finance Scheme | true (boundary — exactly at cap) |
| 6 | ₹4,00,000 | small_business | ₹1,40,001 | Term Loan Scheme (or correct fallback) | true (just over Micro Finance cap) |
| 7 | ₹4,00,000 | larger_project | ₹50,00,000 | Term Loan Scheme | true (boundary — exactly at cap) |
| 8 | ₹4,00,000 | larger_project | ₹50,00,001 | — | false or flagged for manual review (over max) |
| 9 | ₹0 or negative | any | any | — | reject/validation error, not a crash |
| 10 | ₹4,00,000 | (empty/missing project type) | ₹1,00,000 | — | validation error, not a crash |

## 2. Calculator test cases
| # | Scheme | Cost | Tenure | Check |
|---|---|---|---|---|
| 1 | Micro Finance | ₹1,00,000 | 36 mo | loan_amount = ₹90,000 (90% of cost), applicant_contribution = ₹10,000 |
| 2 | Term Loan | ₹20,00,000 | 60 mo | correct rate applied per PRD §6 range, EMI math verified against standard EMI formula by hand for at least one case |
| 3 | Education Loan | ₹8,00,000 | 84 mo | moratorium applied correctly (course duration + buffer, not just a flat number) |
| 4 | Any | ₹0 | any | validation error, not division-by-zero crash |
| 5 | Any | valid | 0 or negative tenure | validation error, not a crash |

**Manual sanity check**: pick one test case and calculate the EMI by hand with a calculator or spreadsheet using the standard formula `EMI = P × r × (1+r)^n / ((1+r)^n - 1)`. If your code's output doesn't match, the bug is in your code, not the formula — check this before the demo, not during it.

## 3. Locator test cases
- Given a known lat/lng and a partner dataset with known distances, verify the returned "nearest 3" are actually the 3 closest (not just the first 3 in the file).
- Verify partners below the risk threshold are excluded or clearly deprioritized, not silently included as if fine.
- Edge case: location with zero partners within any reasonable distance — must show a graceful "no partners found nearby" message, not an empty broken screen.

## 4. Frontend / end-to-end checklist
- [ ] Full flow (Screen 1→5) completable in under 90 seconds by someone who has never seen the app
- [ ] Works on a phone browser at ~375px width, not just desktop
- [ ] Language toggle switches every visible string, not just some (check every screen after toggling)
- [ ] Refreshing mid-flow doesn't crash the app (it's okay to reset to Screen 1, not okay to show a white screen/error)
- [ ] Invalid form input (negative numbers, empty required fields) shows a clear message, doesn't silently fail or crash
- [ ] "Start Over" fully resets state (see Memory.md) — test by going through the flow twice in a row

## 5. n8n workflow checklist
- [ ] Submitting the form live results in a new row in the "Leads" Google Sheet within a few seconds
- [ ] Applicant confirmation email actually arrives (test with a real inbox, not just "the node ran successfully")
- [ ] Partner notification email actually arrives
- [ ] Workflow 2 manual trigger updates risk_score values visibly in the "Partners" sheet
- [ ] Test what happens if n8n is slow/down during the demo — does the frontend degrade gracefully? (see Architecture.md failure modes)

## 6. Pre-demo final check (run this exact sequence 1 hour before your slot)
1. Open the deployed frontend URL fresh (not localhost) on a phone.
2. Complete the full flow once, live, exactly as you will on stage.
3. Confirm the email and Sheet row appear.
4. Hit the backend health endpoint a few times to defeat cold-start (Render/Railway free tier).
5. Confirm the language toggle works on the deployed version (not just localhost — CDN/build issues can break this).
