"""
test_phase1.py
Test suite for Phase 1:
- Recommender rules engine test cases from PHASES.md / PRD.md
- EMI calculator math logic
- FastAPI HTTP endpoint integration tests
"""

import sys
import io

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi.testclient import TestClient

from recommend import recommend_scheme
from calculator import calculate_emi
from main import app


client = TestClient(app)


def test_case_1_micro_finance():
    """
    Test Case 1: Income ₹4L, project cost ₹1L, small business -> Micro Finance Scheme
    """
    result = recommend_scheme(
        income=400000,
        project_type="small_business",
        project_cost=100000,
        education_need=False,
    )
    assert result["eligible"] is True
    assert result["recommended_scheme"] == "Micro Finance Scheme"
    assert "within the" in result["reason"].lower() or "micro" in result["reason"].lower()
    assert "Term Loan Scheme" in result["alternates"]


def test_case_2_term_loan():
    """
    Test Case 2: Income ₹3L, project cost ₹20L, manufacturing -> Term Loan Scheme
    """
    result = recommend_scheme(
        income=300000,
        project_type="manufacturing",
        project_cost=2000000,
        education_need=False,
    )
    assert result["eligible"] is True
    assert result["recommended_scheme"] == "Term Loan Scheme"
    assert "term loan" in result["reason"].lower()


def test_case_3_education_loan():
    """
    Test Case 3: Income ₹2L, admission to engineering course, cost ₹8L -> Education Loan Scheme
    """
    result = recommend_scheme(
        income=200000,
        project_type="engineering",
        project_cost=800000,
        education_need=True,
    )
    assert result["eligible"] is True
    assert result["recommended_scheme"] == "Education Loan Scheme"
    assert "education" in result["reason"].lower()


def test_case_4_income_over_threshold():
    """
    Test Case 4 (Edge Case): Income ₹6L (over ₹5L threshold) -> Not eligible, show reason
    """
    result = recommend_scheme(
        income=600000,
        project_type="small_business",
        project_cost=100000,
        education_need=False,
    )
    assert result["eligible"] is False
    assert result["recommended_scheme"] is None
    assert "exceeds the eligibility limit" in result["reason"]


def test_case_5_micro_finance_boundary():
    """
    Test Case 5 (Boundary Case): Cost ₹1.4L exactly on Micro Finance boundary -> Micro Finance Scheme
    """
    result = recommend_scheme(
        income=350000,
        project_type="small_business",
        project_cost=140000,
        education_need=False,
    )
    assert result["eligible"] is True
    assert result["recommended_scheme"] == "Micro Finance Scheme"


def test_case_6_project_cost_exceeding_max_limit():
    """
    Test Case 6 (Edge Case): Project cost ₹60L exceeds ₹50L maximum limit -> Not eligible
    """
    result = recommend_scheme(
        income=300000,
        project_type="manufacturing",
        project_cost=6000000,
        education_need=False,
    )
    assert result["eligible"] is False
    assert result["recommended_scheme"] is None
    assert "exceeds the maximum scheme limit" in result["reason"]


def test_calculator_math():
    """
    Test EMI Calculator math:
    - 90% loan coverage cap
    - 10% applicant contribution
    - Reducing balance formula (Exact EMI = 3334.73 for 108,000 at 7% for 36 months)
    - Moratorium period
    """
    # Test case: cost 120,000, tenure 36 months, 7% rate
    calc = calculate_emi(
        scheme="Micro Finance Scheme",
        project_cost=120000,
        tenure_months=36,
    )
    assert calc["loan_amount"] == 108000.0  # 90% of 120,000
    assert calc["applicant_contribution"] == 12000.0  # 10% of 120,000
    assert calc["interest_rate"] == 7.0
    assert calc["moratorium_months"] == 3
    # Reducing balance EMI is exact 3334.73
    assert abs(calc["emi"] - 3334.73) < 0.05
    assert calc["total_interest"] > 0

    # Test scheme loan cap logic (e.g. Micro Finance with 200,000 cost capped at 140,000)
    calc_cap = calculate_emi(
        scheme="Micro Finance Scheme",
        project_cost=200000,
        tenure_months=24,
    )
    assert calc_cap["loan_amount"] == 140000.0
    assert calc_cap["applicant_contribution"] == 60000.0


def test_api_endpoints():
    """
    Test FastAPI POST /recommend and POST /calculate-emi endpoints via TestClient.
    """
    # 1. Recommend endpoint
    rec_res = client.post(
        "/recommend",
        json={
            "income": 400000,
            "project_type": "small_business",
            "project_cost": 120000,
            "education_need": False,
        },
    )
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["eligible"] is True
    assert rec_data["recommended_scheme"] == "Micro Finance Scheme"

    # 2. Calculate EMI endpoint
    emi_res = client.post(
        "/calculate-emi",
        json={
            "scheme": "Micro Finance Scheme",
            "project_cost": 120000,
            "tenure_months": 36,
        },
    )
    assert emi_res.status_code == 200
    emi_data = emi_res.json()
    assert emi_data["loan_amount"] == 108000.0
    assert emi_data["applicant_contribution"] == 12000.0
    assert emi_data["interest_rate"] == 7.0
    assert emi_data["moratorium_months"] == 3


def run_all_tests():
    test_cases = [
        ("Case 1: Micro Finance (Income Rs 4L, Cost Rs 1L, Small Business)", test_case_1_micro_finance),
        ("Case 2: Term Loan (Income Rs 3L, Cost Rs 20L, Manufacturing)", test_case_2_term_loan),
        ("Case 3: Education Loan (Income Rs 2L, Engineering, Cost Rs 8L)", test_case_3_education_loan),
        ("Case 4: Income > Rs 5L Boundary/Ineligible Case (Income Rs 6L)", test_case_4_income_over_threshold),
        ("Case 5: Exact Rs 1.4L Boundary on Micro Finance Scheme", test_case_5_micro_finance_boundary),
        ("Case 6: Project Cost > Rs 50L Scheme Max Cap (Cost Rs 60L)", test_case_6_project_cost_exceeding_max_limit),
        ("Case 7: EMI Calculator Math (90% Cap, Contribution, Reducing EMI)", test_calculator_math),
        ("Case 8: FastAPI Endpoints (POST /recommend & POST /calculate-emi)", test_api_endpoints),
    ]

    print("\n" + "=" * 70)
    print("           SIH PHASE 1 TEST SUITE - EXECUTION RESULTS")
    print("=" * 70)

    passed = 0
    failed = 0

    for name, func in test_cases:
        try:
            func()
            print(f"[PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name}: {e}")
            failed += 1

    print("-" * 70)
    print(f"Total Tests: {len(test_cases)} | Passed: {passed} | Failed: {failed}")
    print("=" * 70 + "\n")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
