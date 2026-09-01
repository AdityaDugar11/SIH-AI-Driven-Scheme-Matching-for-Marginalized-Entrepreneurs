"""
locator.py
Channel Partner Locator Engine:
- Calculates Haversine distance in kilometers between applicant location and partner branches.
- Filters by scheme eligibility and active status.
- Multi-factor sorting: Proximity + Partner simulated risk score.
- Includes Indian city centroids for instant 1-click demo selection.
"""

import json
import math
import os
from typing import Any, Dict, List, Optional, Tuple


DEFAULT_PARTNERS_PATH = os.path.join(os.path.dirname(__file__), "data", "partners.json")

# Popular Indian city coordinates for quick reference / fallback
CITY_CENTROIDS: Dict[str, Tuple[float, float]] = {
    "delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "hyderabad": (17.3850, 78.4867),
    "lucknow": (26.8467, 80.9462),
    "patna": (25.6110, 85.1270),
    "jaipur": (26.9124, 75.7873),
    "ahmedabad": (23.0225, 72.5714),
    "bhopal": (23.2599, 77.4126),
    "guwahati": (26.1445, 91.7362),
    "pune": (18.5204, 73.8567),
    "chandigarh": (30.7333, 76.7794),
}


def load_partners(filepath: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Loads channel partners list from data/partners.json.
    """
    target_path = filepath or DEFAULT_PARTNERS_PATH
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"Partners dataset not found at: {target_path}")

    with open(target_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data.get("partners", [])


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle distance between two geographic points using Haversine formula.
    Returns distance in kilometers rounded to 2 decimal places.
    """
    # Earth radius in kilometers
    r = 6371.0

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(r * c, 2)


def get_city_coordinates(city_name: str) -> Optional[Tuple[float, float]]:
    """
    Returns latitude and longitude for a recognized Indian city name.
    """
    normalized = city_name.strip().lower()
    return CITY_CENTROIDS.get(normalized)


def find_nearest_partners(
    lat: float,
    lng: float,
    scheme: Optional[str] = None,
    limit: int = 5,
    max_risk_score: Optional[int] = None,
    partners_file: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Finds and ranks the nearest channel partners based on distance and simulated health/risk score.

    Parameters:
        lat (float): Applicant latitude.
        lng (float): Applicant longitude.
        scheme (Optional[str]): Scheme name (e.g. 'Micro Finance Scheme') to filter eligible partners.
        limit (int): Maximum number of partners to return.
        max_risk_score (Optional[int]): Optional threshold to exclude high-risk partners.
        partners_file (Optional[str]): Custom path to partners JSON.

    Returns:
        List[Dict[str, Any]]: Sorted list of nearest matching partners with distance_km and match reasoning.
    """
    partners = load_partners(partners_file)
    results = []

    for p in partners:
        # Check active status
        if not p.get("active_status", True):
            continue

        # Check scheme support
        supported = p.get("supported_schemes", [])
        if scheme and scheme not in supported:
            continue

        # Check risk score threshold if specified
        risk = p.get("simulated_risk_score", 50)
        if max_risk_score is not None and risk > max_risk_score:
            continue

        p_lat = p.get("lat")
        p_lng = p.get("lng")
        if p_lat is None or p_lng is None:
            continue

        dist_km = haversine_distance_km(lat, lng, p_lat, p_lng)

        # Composite match reason
        partner_type = p.get("type", "Partner")
        reason_parts = [
            f"{dist_km} km away",
            f"Institutional Type: {partner_type}",
            f"Health/Risk Score: {risk}/100",
        ]
        if partner_type == "SCA":
            reason_parts.append("Direct State Channelising Agency for SC Welfare")
        elif partner_type == "PSB":
            reason_parts.append("Public Sector Bank with Concessional Counter")
        elif partner_type == "RRB":
            reason_parts.append("Regional Rural Bank with High Rural Reach")
        elif partner_type == "NBFC-MFI":
            reason_parts.append("Fast turnaround for Micro Finance")

        partner_entry = {
            **p,
            "distance_km": dist_km,
            "match_reason": " • ".join(reason_parts),
        }
        results.append(partner_entry)

    # Sort primarily by distance (closest first), secondarily by risk score (lower risk first)
    results.sort(key=lambda x: (x["distance_km"], x.get("simulated_risk_score", 50)))

    return results[:limit]
