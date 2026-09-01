"""
main.py
FastAPI application exposing:
- /recommend : Deterministic scheme recommendation + AI explanation audit trail
- /calculate-emi : Accurate EMI, 90% loan coverage, and amortization values
- /nearest-partners : Haversine geo-distance & risk-filtered channel partner matching
- /partners : Full partner directory for interactive map visualization
- /ai/parse-query : Conversational NLP free-text parsing into structured intake form values
"""

from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from recommend import recommend_scheme
from calculator import calculate_emi
from locator import find_nearest_partners, load_partners, get_city_coordinates
from ai_explainer import parse_natural_language_query, generate_ai_explanation

app = FastAPI(
    title="Concessional Scheme Matching, Locator & AI Engine API",
    description="Deterministic Scheme Recommendation, Financial EMI Engine, Partner Locator, and NLP Assistant for marginalized entrepreneurs.",
    version="2.0.0",
)

# Enable CORS for web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request and Response Models
# ---------------------------------------------------------------------------

class RecommendRequest(BaseModel):
    income: float = Field(..., description="Annual income in INR (e.g., 400000)")
    project_type: str = Field(
        default="small_business",
        description="Type of project or purpose (e.g., small_business, manufacturing, engineering)",
    )
    project_cost: float = Field(..., description="Total estimated project or course cost in INR")
    education_need: bool = Field(default=False, description="True if loan is for education/courses")
    gender: Optional[str] = Field(default=None, description="Optional gender for concession eligibility")


class RecommendResponse(BaseModel):
    recommended_scheme: Optional[str] = Field(
        None, description="Name of recommended scheme, or None if not eligible"
    )
    reason: str = Field(..., description="Plain-language reason for the recommendation")
    alternates: List[str] = Field(default_factory=list, description="Alternative eligible schemes")
    eligible: bool = Field(..., description="True if eligible for any concessional scheme")
    ai_explanation: Optional[Dict[str, Any]] = Field(
        default=None, description="Detailed AI audit checklist and plain-language reasoning"
    )


class EmiCalculateRequest(BaseModel):
    scheme: str = Field(..., description="Scheme name (e.g., 'Micro Finance Scheme')")
    project_cost: float = Field(..., description="Total project cost in INR")
    tenure_months: int = Field(..., description="Repayment tenure in months (e.g., 36)")
    moratorium_months: Optional[int] = Field(
        default=None, description="Optional moratorium period in months"
    )
    interest_rate: Optional[float] = Field(
        default=None, description="Optional custom annual interest rate %"
    )
    gender: Optional[str] = Field(default=None, description="Optional applicant gender")


class EmiCalculateResponse(BaseModel):
    loan_amount: float = Field(..., description="Principal loan amount sanctioned (up to 90% of cost)")
    applicant_contribution: float = Field(..., description="Applicant own contribution (min 10%)")
    interest_rate: float = Field(..., description="Applicable annual interest rate in %")
    emi: float = Field(..., description="Monthly EMI in INR")
    moratorium_months: int = Field(..., description="Moratorium period in months")
    total_interest: float = Field(..., description="Total interest payable over loan tenure in INR")


class NearestPartnersRequest(BaseModel):
    lat: float = Field(..., description="Applicant latitude (e.g., 28.6139)")
    lng: float = Field(..., description="Applicant longitude (e.g., 77.2090)")
    scheme: Optional[str] = Field(
        default="Micro Finance Scheme", description="Scheme to filter eligible partners"
    )
    limit: int = Field(default=5, description="Number of nearest partners to return")
    max_risk_score: Optional[int] = Field(
        default=None, description="Optional maximum risk score threshold"
    )


class PartnerRecord(BaseModel):
    id: str
    name: str
    type: str
    branch_name: Optional[str] = None
    address: Optional[str] = None
    city: str
    state: str
    pincode: Optional[str] = None
    lat: float
    lng: float
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    supported_schemes: List[str]
    simulated_risk_score: int
    simulated: bool = True
    disbursement_speed_days: Optional[int] = None
    distance_km: Optional[float] = None
    match_reason: Optional[str] = None


class NearestPartnersResponse(BaseModel):
    partners: List[PartnerRecord]
    total_found: int
    user_location: Dict[str, float]
    scheme_filter: Optional[str]


class AiParseRequest(BaseModel):
    query: str = Field(..., description="Free-text or conversational prompt from applicant")


class AiParseResponse(BaseModel):
    income: float
    project_type: str
    project_cost: float
    education_need: bool
    city: str
    gender: str
    tenure_months: int
    extracted_from: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Concessional Scheme Matching & AI Engine",
        "version": "2.0.0",
        "endpoints": [
            "/recommend",
            "/calculate-emi",
            "/nearest-partners",
            "/partners",
            "/ai/parse-query",
            "/health",
        ],
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/recommend", response_model=RecommendResponse)
def get_recommendation(payload: RecommendRequest):
    """
    Evaluates applicant profile against scheme rules and returns recommended scheme,
    alternates, and plain-language AI explanation.
    """
    try:
        result = recommend_scheme(
            income=payload.income,
            project_type=payload.project_type,
            project_cost=payload.project_cost,
            education_need=payload.education_need,
            gender=payload.gender,
        )
        return RecommendResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calculate-emi", response_model=EmiCalculateResponse)
def get_emi_calculation(payload: EmiCalculateRequest):
    """
    Calculates 90% loan amount, 10% applicant share, reducing balance EMI, moratorium, and total interest.
    """
    try:
        result = calculate_emi(
            scheme=payload.scheme,
            project_cost=payload.project_cost,
            tenure_months=payload.tenure_months,
            moratorium_months=payload.moratorium_months,
            custom_interest_rate=payload.interest_rate,
            gender=payload.gender,
        )
        return EmiCalculateResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nearest-partners", response_model=NearestPartnersResponse)
def get_nearest_partners(payload: NearestPartnersRequest):
    """
    Calculates Haversine distance and returns nearest eligible channel partners,
    ranked by proximity and simulated risk score.
    """
    try:
        partners = find_nearest_partners(
            lat=payload.lat,
            lng=payload.lng,
            scheme=payload.scheme,
            limit=payload.limit,
            max_risk_score=payload.max_risk_score,
        )
        return NearestPartnersResponse(
            partners=[PartnerRecord(**p) for p in partners],
            total_found=len(partners),
            user_location={"lat": payload.lat, "lng": payload.lng},
            scheme_filter=payload.scheme,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/partners")
def list_all_partners(city: Optional[str] = None):
    """
    Returns full list of channel partners, optionally filtered by city name.
    """
    try:
        all_partners = load_partners()
        if city:
            city_norm = city.strip().lower()
            all_partners = [p for p in all_partners if p.get("city", "").lower() == city_norm]
        return {"partners": all_partners, "count": len(all_partners)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/parse-query", response_model=AiParseResponse)
def parse_conversational_query(payload: AiParseRequest):
    """
    NLP layer to parse conversational English/Hindi-transliterated text into structured applicant parameters.
    """
    try:
        parsed = parse_natural_language_query(payload.query)
        return AiParseResponse(**parsed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
