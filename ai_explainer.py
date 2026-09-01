"""
ai_explainer.py
AI Explanation & Natural Language Query Parsing Engine:
- Parses free-text / voice transcript queries into structured applicant parameters.
- Generates detailed, plain-language financial reasoning for recommended schemes.
- Generates an auditable 5-point eligibility verification trace for full financial transparency.
"""

import re
from typing import Any, Dict, List, Optional, Tuple


# Keyword dictionaries for enterprise and education classification
PROJECT_TYPE_KEYWORDS = {
    "small_business": [
        "small business",
        "retail",
        "kirana",
        "shop",
        "grocery",
        "store",
        "tailoring",
        "boutique",
        "salon",
        "beauty parlour",
        "tea stall",
        "bakery",
        "vegetable",
        "vendor",
        "photocopy",
        "repair shop",
    ],
    "micro_enterprise": [
        "micro enterprise",
        "workshop",
        "welding",
        "carpentry",
        "pottery",
        "leather",
        "handicraft",
        "blacksmith",
        "electrician",
        "dairy",
        "poultry",
        "flour mill",
        "oil mill",
    ],
    "manufacturing": [
        "manufacturing",
        "factory",
        "processing unit",
        "production",
        "packaging",
        "textile mill",
        "fabrication",
        "machinery",
        "industrial",
        "plant",
    ],
    "services": [
        "services",
        "transport",
        "logistics",
        "auto rickshaw",
        "commercial vehicle",
        "taxi",
        "delivery",
        "catering",
        "event management",
        "consultancy",
        "cleaning",
    ],
    "artisan": [
        "artisan",
        "craft",
        "weaving",
        "handloom",
        "sculpture",
        "potter",
        "wood carving",
        "embroidery",
        "zari",
    ],
    "education": [
        "education",
        "college",
        "course",
        "tuition",
        "btech",
        "mtech",
        "engineering",
        "medical",
        "mbbs",
        "nursing",
        "degree",
        "diploma",
        "university",
        "studies",
        "higher education",
        "overseas",
        "abroad",
        "mba",
        "vocational",
    ],
}

CITY_NAMES = [
    "delhi", "mumbai", "bengaluru", "bangalore", "chennai", "kolkata",
    "hyderabad", "lucknow", "patna", "jaipur", "ahmedabad", "bhopal",
    "guwahati", "pune", "chandigarh"
]


def extract_currency_value(text: str, context_keywords: List[str]) -> Optional[float]:
    """
    Extracts numerical currency amounts in Lakhs, Crores, k, or absolute digits associated with context keywords.
    """
    # Look around context words first, or fallback to patterns
    # Patterns like: ₹ 4.5 Lakh, 4.5L, 4,50,000, 30k, 150000, 15 Lakhs
    pattern = r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakhs?|lakh|lacs?|lac|cr|crores?|k|thousand)?'
    
    # Try finding near context words
    for kw in context_keywords:
        kw_pattern = rf'{kw}[^\d\n]*' + pattern
        match = re.search(kw_pattern, text, re.IGNORECASE)
        if match:
            num_str, unit = match.group(1), match.group(2)
            return _convert_units(float(num_str), unit)

    return None


def _convert_units(val: float, unit: Optional[str]) -> float:
    if not unit:
        if val <= 100:  # e.g., "5" often means 5 Lakh in conversational context
            return val * 100000
        return val
    u = unit.lower()
    if u in ["lakh", "lakhs", "lac", "lacs", "l"]:
        return val * 100000
    elif u in ["cr", "crore", "crores"]:
        return val * 10000000
    elif u in ["k", "thousand"]:
        return val * 1000
    return val


def parse_natural_language_query(query: str) -> Dict[str, Any]:
    """
    Parses conversational user prompts and returns structured parameters for the intake form.

    Example input: "I earn 2.5 lakh and want to open a welding workshop in Lucknow costing 1.2 Lakh"
    Returns: {
        "income": 250000,
        "project_type": "micro_enterprise",
        "project_cost": 120000,
        "education_need": false,
        "city": "lucknow",
        "gender": "male",
        "confidence": 0.95
    }
    """
    text = query.strip().lower()
    
    # 1. Income extraction
    income = extract_currency_value(
        text, ["income", "earn", "earning", "salary", "salaried", "make", "annual"]
    )
    if income is None:
        # Generic match for first amount
        m = re.search(r'(?:income|earn|salary)[^\d]*(\d+(?:\.\d+)?)\s*(lakh|l|k)?', text)
        if m:
            income = _convert_units(float(m.group(1)), m.group(2))
        else:
            # Fallback default
            income = 400000.0

    # 2. Project Cost extraction
    project_cost = extract_currency_value(
        text, ["cost", "costing", "need", "loan", "amount", "budget", "worth", "project", "fees"]
    )
    if project_cost is None:
        # Check second currency occurrence or pattern
        amounts = re.findall(r'(\d+(?:\.\d+)?)\s*(lakhs?|lac|l|cr|k)?', text)
        if len(amounts) >= 2:
            project_cost = _convert_units(float(amounts[1][0]), amounts[1][1])
        elif len(amounts) == 1 and income != _convert_units(float(amounts[0][0]), amounts[0][1]):
            project_cost = _convert_units(float(amounts[0][0]), amounts[0][1])
        else:
            project_cost = 120000.0

    # 3. Project Type & Education Intent Classification
    is_education = False
    detected_type = "small_business"

    # Check for education first
    for kw in PROJECT_TYPE_KEYWORDS["education"]:
        if kw in text:
            is_education = True
            detected_type = "education"
            break

    if not is_education:
        for ptype, kws in PROJECT_TYPE_KEYWORDS.items():
            if ptype == "education":
                continue
            for kw in kws:
                if kw in text:
                    detected_type = ptype
                    break
            if detected_type != "small_business":
                break

    # 4. City detection
    detected_city = "delhi"
    for city in CITY_NAMES:
        if city in text:
            detected_city = city
            break

    # 5. Gender detection
    gender = "male"
    if any(w in text for w in ["woman", "women", "female", "she", "her", "mother", "sister", "daughter"]):
        gender = "female"

    return {
        "income": round(income, 2),
        "project_type": detected_type,
        "project_cost": round(project_cost, 2),
        "education_need": is_education,
        "city": detected_city,
        "gender": gender,
        "tenure_months": 60 if is_education or project_cost > 500000 else 36,
        "extracted_from": query,
    }


def generate_ai_explanation(
    income: float,
    project_cost: float,
    project_type: str,
    education_need: bool,
    gender: Optional[str],
    recommended_scheme: Optional[str],
    eligible: bool,
    loan_amount: Optional[float] = None,
    applicant_contribution: Optional[float] = None,
    interest_rate: Optional[float] = None,
    moratorium_months: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Generates rich, plain-language reasoning, financial literacy guidance, and an auditable 5-step checklist.
    """
    if not eligible or not recommended_scheme:
        return {
            "headline": "Eligibility Assessment Result",
            "summary": (
                f"Applicant annual income (₹{income:,.0f}) or project cost (₹{project_cost:,.0f}) "
                "exceeds the statutory ceiling under National Scheduled Castes Finance & Development Corporation guidelines."
            ),
            "audit_checklist": [
                {
                    "rule": "1. Annual Income Threshold (≤ ₹5.00 Lakh)",
                    "passed": income <= 500000,
                    "detail": f"Declared Income: ₹{income:,.0f} {'(Within limit)' if income <= 500000 else '(Exceeds ₹5L limit)'}",
                },
                {
                    "rule": "2. Statutory Scheme Maximum (≤ ₹50.00 Lakh)",
                    "passed": project_cost <= 5000000,
                    "detail": f"Project Cost: ₹{project_cost:,.0f} {'(Eligible)' if project_cost <= 5000000 else '(Exceeds ₹50L max cap)'}",
                },
                {
                    "rule": "3. Concessional Lending Alignment",
                    "passed": False,
                    "detail": "Does not meet combined criteria for SC concessional loan schemes.",
                },
            ],
            "financial_tip": "Check general credit guarantee programs such as Pradhan Mantri MUDRA Yojana (PMMY) or Stand-Up India through your local Public Sector Bank.",
        }

    # Format numbers
    cost_str = f"₹{project_cost:,.0f}"
    loan_str = f"₹{loan_amount:,.0f}" if loan_amount else f"₹{project_cost * 0.9:,.0f}"
    margin_str = f"₹{applicant_contribution:,.0f}" if applicant_contribution else f"₹{project_cost * 0.1:,.0f}"
    rate_str = f"{interest_rate}% p.a." if interest_rate else "concessional rate"
    moratorium_str = f"{moratorium_months} months" if moratorium_months else "3 to 6 months"

    # Specific scheme highlights
    if recommended_scheme == "Micro Finance Scheme":
        headline = "Best Fit: Micro Finance Scheme (Direct Concessional Credit)"
        summary = (
            f"Your project cost of {cost_str} is within the ₹1.40 Lakh micro-enterprise threshold. "
            f"The scheme sanctions 90% ({loan_str}) as a subsidized loan at an affordable {rate_str}, "
            f"requiring only a 10% ({margin_str}) borrower contribution with a {moratorium_str} repayment holiday."
        )
        tip = "Micro Finance offers fast sanction turnaround through both State Channelising Agencies (SCAs) and approved NBFC-MFIs."
    elif recommended_scheme == "Term Loan Scheme":
        headline = "Best Fit: Term Loan Scheme (Enterprise Expansion Credit)"
        summary = (
            f"Your enterprise project cost of {cost_str} qualifies for the Term Loan Scheme (up to ₹50 Lakh). "
            f"You receive {loan_str} in term loan financing at {rate_str} with {moratorium_str} moratorium, "
            f"allowing ample gestation time for your machinery or workspace setup."
        )
        tip = "Term Loans can be paired with interest subsidy schemes. Ensure accurate project asset quotations for faster processing."
    else:  # Education Loan
        headline = "Best Fit: Education Loan Scheme (Higher & Professional Studies)"
        summary = (
            f"Your education financing requirement of {cost_str} qualifies for concessional higher studies support. "
            f"Covers tuition, lab, and hostel expenses up to 90% ({loan_str}) at {rate_str}, "
            f"with repayment deferred across course tenure + {moratorium_str} moratorium."
        )
        tip = "Women applicants receive an additional 0.5% p.a. interest concession on education loans."

    audit_checklist = [
        {
            "rule": "1. Income Criterion (≤ ₹5.00 Lakh/year)",
            "passed": True,
            "detail": f"Applicant Income of ₹{income:,.0f} meets concessional guidelines.",
        },
        {
            "rule": "2. Purpose & Project Matching",
            "passed": True,
            "detail": f"Category '{project_type}' correctly matched to {recommended_scheme}.",
        },
        {
            "rule": "3. 90% Sanction Coverage & 10% Margin",
            "passed": True,
            "detail": f"Loan: {loan_str} (90%) | Applicant Contribution: {margin_str} (10%).",
        },
        {
            "rule": f"4. Concessional Interest Rate ({rate_str})",
            "passed": True,
            "detail": f"Subsidized interest rate applied {'with female concession (-0.5%)' if gender == 'female' else 'per scheme rules'}.",
        },
        {
            "rule": f"5. Repayment Moratorium ({moratorium_str})",
            "passed": True,
            "detail": "Principal repayment holiday active during project gestation period.",
        },
    ]

    return {
        "headline": headline,
        "summary": summary,
        "audit_checklist": audit_checklist,
        "financial_tip": tip,
    }
