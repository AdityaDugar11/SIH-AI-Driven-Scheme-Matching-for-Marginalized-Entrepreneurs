import json
import os

# Try to load schemes dynamically from JSON if the parser has run
SCHEMES_FILE = os.path.join(os.path.dirname(__file__), "schemes.json")

if os.path.exists(SCHEMES_FILE):
    try:
        with open(SCHEMES_FILE, 'r') as f:
            SCHEMES = json.load(f)
            # Add IDs if they don't exist
            for i, scheme in enumerate(SCHEMES):
                if "id" not in scheme:
                    scheme["id"] = i + 1
    except Exception as e:
        print(f"Error loading schemes.json: {e}")
        SCHEMES = []
else:
    # Fallback mock database of schemes
    SCHEMES = [
        {
            "id": 1,
            "name": "NSFDC Micro Credit Finance",
            "type": "Central",
            "loanType": "Micro Finance",
            "maxLimit": "₹1,40,000",
            "interest": "5%",
            "rules": {
                "max_income": 300000,
                "caste_required": ["SC"],
                "max_project_cost": 150000
            },
            "base_documents": ["Aadhaar", "Income Certificate", "Caste Certificate", "Bank Details"]
        },
        {
            "id": 2,
            "name": "Term Loan Scheme (NSFDC)",
            "type": "Central",
            "loanType": "Term Loan",
            "maxLimit": "₹50,00,000",
            "interest": "6%",
            "rules": {
                "max_income": 300000,
                "caste_required": ["SC"],
                "max_project_cost": 5000000
            },
            "base_documents": ["Aadhaar", "Income Certificate", "Caste Certificate", "Detailed Project Report (DPR)", "Quotations"]
        },
        {
            "id": 3,
            "name": "State Education Loan Concession",
            "type": "State",
            "loanType": "Education Loan",
            "maxLimit": "₹20,00,000",
            "interest": "4%",
            "rules": {
                "max_income": 500000,
                "caste_required": ["SC", "ST", "OBC"],
                "project_type": "Education"
            },
            "base_documents": ["Aadhaar", "Income Certificate", "Caste Certificate", "Admission Letter", "Fee Structure"]
        },
        {
            "id": 4,
            "name": "Mahila Samriddhi Yojana",
            "type": "Central",
            "loanType": "Micro Finance",
            "maxLimit": "₹1,40,000",
            "interest": "4%",
            "rules": {
                "max_income": 300000,
                "caste_required": ["SC"],
                "gender_required": "Female",
                "max_project_cost": 150000
            },
            "base_documents": ["Aadhaar", "Income Certificate", "Caste Certificate", "Self Help Group (SHG) Details"]
        }
    ]

def evaluate_scheme(user_profile, scheme):
    """
    Evaluates a user profile against a scheme's rules.
    Returns: (match_percentage, reasons, is_eligible)
    """
    reasons = []
    score = 100
    is_eligible = True
    rules = scheme["rules"]

    # 1. Check Income
    user_income = float(user_profile.get("income", 0))
    if "max_income" in rules:
        if user_income <= rules["max_income"]:
            reasons.append({"text": f"Income (₹{user_income}) is under the ₹{rules['max_income']} limit.", "type": "success"})
        else:
            reasons.append({"text": f"Income (₹{user_income}) exceeds the ₹{rules['max_income']} limit.", "type": "error"})
            score -= 50
            is_eligible = False

    # 2. Check Caste
    user_caste = user_profile.get("caste", "")
    if "caste_required" in rules:
        if user_caste in rules["caste_required"]:
            reasons.append({"text": f"Caste ({user_caste}) is eligible.", "type": "success"})
        else:
            reasons.append({"text": f"Scheme is specifically for {', '.join(rules['caste_required'])} categories.", "type": "error"})
            score -= 100
            is_eligible = False

    # 3. Check Gender (if applicable)
    if "gender_required" in rules:
        user_gender = user_profile.get("gender", "").lower()
        required_gender = rules["gender_required"].lower()
        if user_gender == required_gender:
            reasons.append({"text": f"Gender requirement ({rules['gender_required']}) met.", "type": "success"})
        else:
            reasons.append({"text": f"This scheme is exclusively for {rules['gender_required']} applicants.", "type": "error"})
            score -= 100
            is_eligible = False

    # 4. Check Project Cost
    if "max_project_cost" in rules:
        user_cost = float(user_profile.get("estimatedCost", 0))
        if user_cost <= rules["max_project_cost"]:
            reasons.append({"text": "Project cost is within limits.", "type": "success"})
        else:
            reasons.append({"text": f"Warning: Your project cost (₹{user_cost}) exceeds max limit (₹{rules['max_project_cost']}). You must fund the rest yourself.", "type": "warning"})
            score -= 25 # Partial penalty, still eligible but warned

    # 5. Check Project Type (e.g. Education)
    if "project_type" in rules:
        user_project_type = user_profile.get("projectType", "").lower()
        if rules["project_type"].lower() in user_project_type:
            reasons.append({"text": f"Matches your project type: {rules['project_type']}.", "type": "success"})
        else:
            reasons.append({"text": f"This is an {rules['project_type']} scheme, but you selected {user_profile.get('projectType')}.", "type": "error"})
            score -= 80
            is_eligible = False

    # Ensure score doesn't drop below 0
    match_percentage = max(0, score)

    return match_percentage, reasons, is_eligible
