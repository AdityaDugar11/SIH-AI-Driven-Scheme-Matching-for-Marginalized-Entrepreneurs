"""
recommend.py
Deterministic eligibility rules engine for concessional loan schemes.
Dynamically reads scheme rules from data/schemes.json.
"""

import json
import os
from typing import Any, Dict, List, Optional


DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "schemes.json")


def load_schemes(filepath: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Dynamically loads scheme rule configurations from data/schemes.json.
    """
    target_path = filepath or DEFAULT_DATA_PATH
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"Schemes configuration file not found at: {target_path}")

    with open(target_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data.get("schemes", [])


def get_scheme_by_name_or_id(identifier: str, filepath: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Retrieves a scheme by its ID or Name.
    """
    schemes = load_schemes(filepath)
    normalized = identifier.strip().lower()
    for s in schemes:
        if s.get("id", "").lower() == normalized or s.get("name", "").lower() == normalized:
            return s
    return None


def recommend_scheme(
    income: float,
    project_type: str,
    project_cost: float,
    education_need: bool = False,
    gender: Optional[str] = None,
    schemes_file: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Deterministic rules engine to evaluate applicant eligibility and recommend
    the best-fit concessional loan scheme along with plain-language explanations and alternates.

    Parameters:
        income (float): Annual family/individual income in INR.
        project_type (str): Type of enterprise or purpose (e.g., 'small_business', 'manufacturing', 'engineering').
        project_cost (float): Estimated project or course cost in INR.
        education_need (bool): True if loan is required for education/courses.
        gender (Optional[str]): Applicant gender for concession rules.
        schemes_file (Optional[str]): Path to schemes JSON file.

    Returns:
        Dict[str, Any]: Recommendation result with recommended_scheme, reason, alternates, and eligible flag.
    """
    schemes = load_schemes(schemes_file)
    scheme_dict = {s["id"]: s for s in schemes}

    micro_finance = scheme_dict.get("micro_finance", {})
    term_loan = scheme_dict.get("term_loan", {})
    education_loan = scheme_dict.get("education_loan", {})

    income_limit = micro_finance.get("max_income", 500000)

    # 1. Income Eligibility Check
    if income > income_limit:
        return {
            "recommended_scheme": None,
            "reason": (
                f"Annual income of ₹{income:,.0f} exceeds the eligibility limit of "
                f"₹{income_limit / 100000:.2f} Lakh for concessional lending schemes."
            ),
            "alternates": [],
            "eligible": False,
        }

    # Normalize inputs
    normalized_proj_type = (project_type or "").strip().lower()
    is_education = (
        education_need
        or normalized_proj_type in [
            "education",
            "course",
            "higher_education",
            "engineering",
            "medical",
            "vocational",
            "study",
            "studies",
        ]
    )

    # 2. Education Loan Route
    if is_education:
        max_edu_cost = education_loan.get("max_project_cost", 5000000)
        if project_cost > max_edu_cost:
            return {
                "recommended_scheme": None,
                "reason": (
                    f"Course cost of ₹{project_cost:,.0f} exceeds the maximum limit of "
                    f"₹{max_edu_cost / 100000:.2f} Lakh for Education Loan Scheme."
                ),
                "alternates": [],
                "eligible": False,
            }

        return {
            "recommended_scheme": education_loan.get("name", "Education Loan Scheme"),
            "reason": (
                "You qualify for the Education Loan Scheme covering up to 90% of course expenses "
                "for recognized professional and higher education programs."
            ),
            "alternates": [term_loan.get("name", "Term Loan Scheme")] if term_loan else [],
            "eligible": True,
        }

    # 3. Enterprise / Business Project Route
    micro_cap = micro_finance.get("max_project_cost", 140000)
    term_cap = term_loan.get("max_project_cost", 5000000)

    # Boundary check: cost <= 1.40 Lakh qualifies for Micro Finance
    if project_cost <= micro_cap:
        alternates = []
        if term_loan:
            alternates.append(term_loan.get("name", "Term Loan Scheme"))

        return {
            "recommended_scheme": micro_finance.get("name", "Micro Finance Scheme"),
            "reason": (
                f"Your project cost is within the ₹{micro_cap / 100000:.2f} Lakh limit "
                "and your income qualifies for concessional lending."
            ),
            "alternates": alternates,
            "eligible": True,
        }
    elif project_cost <= term_cap:
        alternates = []
        # If cost is near micro boundary or user wants smaller initial draw
        if micro_finance:
            alternates.append(micro_finance.get("name", "Micro Finance Scheme"))

        return {
            "recommended_scheme": term_loan.get("name", "Term Loan Scheme"),
            "reason": (
                f"Your project cost of ₹{project_cost:,.0f} qualifies under the Term Loan Scheme "
                f"for manufacturing, trade, or service projects (up to ₹{term_cap / 100000:.2f} Lakh)."
            ),
            "alternates": alternates,
            "eligible": True,
        }
    else:
        # Project cost exceeds term loan cap of 50 Lakh
        return {
            "recommended_scheme": None,
            "reason": (
                f"Project cost of ₹{project_cost:,.0f} exceeds the maximum scheme limit of "
                f"₹{term_cap / 100000:.2f} Lakh."
            ),
            "alternates": [],
            "eligible": False,
        }
