"""
main.py
FastAPI application exposing /recommend and /calculate-emi endpoints
for AI-Driven Scheme Matching for Marginalized Entrepreneurs.
"""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from recommend import recommend_scheme
from calculator import calculate_emi

app = FastAPI(
    title="Concessional Scheme Matching & EMI API",
    description="API for recommending concessional loan schemes to SC-category entrepreneurs and calculating EMIs.",
    version="1.0.0",
)

# Enable CORS for local development and web frontends
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


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Concessional Scheme Matching Engine",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/recommend", response_model=RecommendResponse)
def get_recommendation(payload: RecommendRequest):
    """
    Evaluates applicant profile against scheme rules and returns recommended scheme.
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
