"""
calculator.py
EMI calculation math logic for concessional loan schemes.
Applies 90% loan cap, interest rates, and moratorium period.
"""

from typing import Any, Dict, Optional
from recommend import get_scheme_by_name_or_id, load_schemes


def determine_interest_rate(
    scheme: Dict[str, Any],
    loan_amount: float,
    gender: Optional[str] = None,
    custom_rate: Optional[float] = None,
) -> float:
    """
    Determines the applicable annual interest rate (%) based on scheme rules,
    tiered loan amount brackets, and concessions (e.g., for women entrepreneurs/students).
    """
    if custom_rate is not None:
        return float(custom_rate)

    # Check interest tiers if present (e.g., Term Loan)
    tiers = scheme.get("interest_tiers")
    if tiers:
        for tier in tiers:
            if loan_amount <= tier.get("up_to_amount", float("inf")):
                return float(tier.get("rate"))

    base_rate = float(scheme.get("interest_rate_default", 7.0))

    # Apply women concession if applicable
    if gender and gender.strip().lower() in ["female", "woman", "girl"]:
        concession = float(scheme.get("interest_rate_women_concession", 0.0))
        base_rate = max(scheme.get("interest_rate_min", 6.5), base_rate - concession)

    return base_rate


def calculate_emi(
    scheme: str,
    project_cost: float,
    tenure_months: int,
    moratorium_months: Optional[int] = None,
    custom_interest_rate: Optional[float] = None,
    gender: Optional[str] = None,
    schemes_file: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Calculates loan amount, applicant contribution, applicable interest rate,
    monthly EMI, moratorium period, and total interest payable.

    Formula:
        Loan covers up to 90% of project/course cost, capped at scheme max amount.
        Applicant contribution is remaining 10% (plus any amount above scheme cap).
        Reducing Balance EMI: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        where r = annual_rate / (12 * 100), n = tenure_months, P = loan_amount.

    Returns:
        Dict[str, Any] matching API specification in TECH_STACK.md.
    """
    if project_cost <= 0:
        raise ValueError("Project cost must be greater than zero.")
    if tenure_months <= 0:
        raise ValueError("Tenure months must be greater than zero.")

    scheme_data = get_scheme_by_name_or_id(scheme, filepath=schemes_file)
    if not scheme_data:
        # Fallback default configuration if generic name is passed
        scheme_data = {
            "name": scheme,
            "max_loan_amount": 5000000.0,
            "loan_coverage_pct": 90.0,
            "applicant_contribution_pct": 10.0,
            "interest_rate_default": 7.0,
            "moratorium_months_default": 3,
        }

    coverage_pct = float(scheme_data.get("loan_coverage_pct", 90.0)) / 100.0
    max_loan = float(scheme_data.get("max_loan_amount", 5000000.0))

    # 90% loan coverage capped at scheme maximum loan amount
    raw_loan = project_cost * coverage_pct
    loan_amount = min(raw_loan, max_loan)
    applicant_contribution = project_cost - loan_amount

    # Interest rate determination
    interest_rate = determine_interest_rate(
        scheme=scheme_data,
        loan_amount=loan_amount,
        gender=gender,
        custom_rate=custom_interest_rate,
    )

    # Moratorium months
    if moratorium_months is None:
        moratorium_months = int(scheme_data.get("moratorium_months_default", 3))

    # Standard reducing balance EMI formula
    monthly_rate = (interest_rate / 100.0) / 12.0
    n = tenure_months

    if monthly_rate > 0:
        rate_factor = (1.0 + monthly_rate) ** n
        emi = loan_amount * monthly_rate * rate_factor / (rate_factor - 1.0)
    else:
        emi = loan_amount / n

    total_payment = emi * n
    total_interest = total_payment - loan_amount

    return {
        "loan_amount": round(loan_amount, 2),
        "applicant_contribution": round(applicant_contribution, 2),
        "interest_rate": round(interest_rate, 2),
        "emi": round(emi, 2),
        "moratorium_months": int(moratorium_months),
        "total_interest": round(total_interest, 2),
    }
