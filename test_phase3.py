"""
test_phase3.py
Test suite for Phase 3:
- Channel partner dataset schema and integrity tests
- Haversine distance formula accuracy
- Nearest partners ranking by distance & risk score
- AI Explanation and 5-point audit checklist generator
- AI Natural Language free-text query parsing
- FastAPI HTTP integration tests for /nearest-partners, /partners, /ai/parse-query
"""

import sys
import os

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi.testclient import TestClient

from locator import load_partners, haversine_distance_km, find_nearest_partners, get_city_coordinates
from ai_explainer import parse_natural_language_query, generate_ai_explanation
from recommend import recommend_scheme
from main import app

client = TestClient(app)


def test_partner_dataset_integrity():
    """Verify partner dataset has >= 30 records and all necessary fields."""
    partners = load_partners()
    assert len(partners) >= 30, f"Expected at least 30 partners, got {len(partners)}"
    
    types_found = set()
    for p in partners:
        assert "id" in p and p["id"].startswith("P")
        assert "name" in p and len(p["name"]) > 0
        assert "type" in p and p["type"] in ["SCA", "PSB", "RRB", "NBFC-MFI"]
        assert "lat" in p and isinstance(p["lat"], (int, float))
        assert "lng" in p and isinstance(p["lng"], (int, float))
        assert "supported_schemes" in p and len(p["supported_schemes"]) > 0
        assert "simulated_risk_score" in p and 0 <= p["simulated_risk_score"] <= 100
        assert p.get("simulated") is True, f"Partner {p['id']} must declare simulated: true"
        assert "contact_email" in p and "@" in p["contact_email"]
        types_found.add(p["type"])

    # Ensure diverse institution representation
    assert len(types_found) == 4, f"Expected SCA, PSB, RRB, NBFC-MFI types, got {types_found}"


def test_haversine_distance():
    """Verify haversine distance calculation against known geographical coordinates."""
    # Delhi (28.6139, 77.2090) to Mumbai (19.0760, 72.8777) is ~1148 km
    dist = haversine_distance_km(28.6139, 77.2090, 19.0760, 72.8777)
    assert 1140 < dist < 1160, f"Expected ~1148 km between Delhi and Mumbai, got {dist}"

    # Distance to identical point is 0
    zero_dist = haversine_distance_km(28.6139, 77.2090, 28.6139, 77.2090)
    assert zero_dist == 0.0


def test_find_nearest_partners_delhi():
    """Verify finding nearest partners in Delhi area."""
    delhi_coords = get_city_coordinates("delhi")
    assert delhi_coords is not None
    lat, lng = delhi_coords

    nearest = find_nearest_partners(
        lat=lat,
        lng=lng,
        scheme="Micro Finance Scheme",
        limit=3,
    )
    assert len(nearest) == 3
    # Nearest should be within Delhi NCR (< 30km)
    assert nearest[0]["distance_km"] < 30
    assert nearest[0]["city"] == "New Delhi"
    # Ensure distance is monotonically non-decreasing
    assert nearest[0]["distance_km"] <= nearest[1]["distance_km"] <= nearest[2]["distance_km"]


def test_ai_query_parser():
    """Test conversational text extraction for various real-world applicant prompts."""
    # Case 1: Micro finance in Lucknow
    q1 = "I earn 2.5 lakh annually and want to open a small kirana shop in Lucknow costing 1.2 Lakh"
    p1 = parse_natural_language_query(q1)
    assert p1["income"] == 250000.0
    assert p1["project_cost"] == 120000.0
    assert p1["project_type"] == "small_business"
    assert p1["education_need"] is False
    assert p1["city"] == "lucknow"

    # Case 2: Education loan for engineering
    q2 = "My daughter got admission in engineering college fees 8 Lakhs, my salary is 300000"
    p2 = parse_natural_language_query(q2)
    assert p2["income"] == 300000.0
    assert p2["project_cost"] == 800000.0
    assert p2["education_need"] is True
    assert p2["gender"] == "female"

    # Case 3: Manufacturing term loan
    q3 = "We need 25 Lakhs loan for our fabrication manufacturing unit, income 4.5L"
    p3 = parse_natural_language_query(q3)
    assert p3["income"] == 450000.0
    assert p3["project_cost"] == 2500000.0
    assert p3["project_type"] == "manufacturing"


def test_ai_explanation_and_audit():
    """Test AI explanation and 5-point audit checklist generation."""
    rec = recommend_scheme(
        income=350000,
        project_type="small_business",
        project_cost=120000,
        education_need=False,
    )
    assert rec["eligible"] is True
    assert "ai_explanation" in rec
    ai_exp = rec["ai_explanation"]
    assert "headline" in ai_exp
    assert "summary" in ai_exp
    assert "audit_checklist" in ai_exp
    assert len(ai_exp["audit_checklist"]) == 5
    assert all(item["passed"] for item in ai_exp["audit_checklist"])


def test_api_nearest_partners_endpoint():
    """Test POST /nearest-partners endpoint via TestClient."""
    res = client.post(
        "/nearest-partners",
        json={
            "lat": 12.9716,
            "lng": 77.5946,
            "scheme": "Micro Finance Scheme",
            "limit": 3,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_found"] == 3
    assert len(data["partners"]) == 3
    assert data["partners"][0]["city"] == "Bengaluru"
    assert data["partners"][0]["simulated"] is True
    assert "match_reason" in data["partners"][0]


def test_api_ai_parse_endpoint():
    """Test POST /ai/parse-query endpoint via TestClient."""
    res = client.post(
        "/ai/parse-query",
        json={"query": "I earn 3.5 Lakh and need 15 Lakhs for my welding factory in Jaipur"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["income"] == 350000.0
    assert data["project_cost"] == 1500000.0
    assert data["project_type"] == "micro_enterprise"
    assert data["city"] == "jaipur"


def test_api_partners_list_endpoint():
    """Test GET /partners endpoint."""
    res = client.get("/partners?city=Mumbai")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 3
    for p in data["partners"]:
        assert p["city"].lower() == "mumbai"


def run_all_tests():
    test_cases = [
        ("Partner Dataset Integrity (>=30 records, diverse types, simulated:true)", test_partner_dataset_integrity),
        ("Haversine Distance Formula Accuracy", test_haversine_distance),
        ("Nearest Partners Ranking in Delhi Area", test_find_nearest_partners_delhi),
        ("AI NLP Natural Language Query Parser", test_ai_query_parser),
        ("AI Explanation & 5-Point Audit Checklist Generator", test_ai_explanation_and_audit),
        ("API POST /nearest-partners Endpoint", test_api_nearest_partners_endpoint),
        ("API POST /ai/parse-query Endpoint", test_api_ai_parse_endpoint),
        ("API GET /partners Endpoint", test_api_partners_list_endpoint),
    ]

    print("\n" + "=" * 75)
    print("           SIH PHASE 3 TEST SUITE - EXECUTION RESULTS")
    print("=" * 75)

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

    print("-" * 75)
    print(f"Total Tests: {len(test_cases)} | Passed: {passed} | Failed: {failed}")
    print("=" * 75 + "\n")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
