from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import json
from dotenv import load_dotenv
load_dotenv()

from .schemes_db import SCHEMES, evaluate_scheme
from google import genai
from google.genai import types
from supabase import create_client, Client
from . import db_store

# Initialize Supabase client
SUPABASE_URL = "https://givyetklwfexhjwhlqew.supabase.co"
SUPABASE_KEY = "sb_publishable_YSkDTDa2Oafn-nqocXoNVA_YiPbnFCW"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="SchemeMatcher API")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InterestRequest(BaseModel):
    user_id: str
    scheme_id: int
    user_email: str
    user_name: str
    scheme_name: str

class SearchRequest(BaseModel):
    query: str
    
class ChatRequest(BaseModel):
    message: str
    
class RecommendRequest(BaseModel):
    profile: dict
    lang: str = "en"

class ApplicationRequest(BaseModel):
    user_id: str
    scheme_id: int
    scheme_name: str
    requested_amount: float = 500000.0

class SaveSchemeRequest(BaseModel):
    user_id: str
    scheme_id: int

# IMPORTANT: Replace with your actual n8n Webhook URL once n8n is running
N8N_WEBHOOK_URL = "https://scheme-matcher-n8n.onrender.com/webhook/lead-intake"

@app.post("/api/applications")
async def create_application(req: ApplicationRequest):
    try:
        new_app = db_store.apply_for_scheme(
            user_id=req.user_id,
            scheme_id=req.scheme_id,
            scheme_name=req.scheme_name,
            requested_amount=req.requested_amount
        )
        return {"status": "success", "application": new_app}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/applications/{user_id}")
async def get_applications(user_id: str):
    apps = db_store.get_user_applications(user_id)
    return {"applications": apps}

@app.post("/api/saved-schemes")
async def save_scheme(req: SaveSchemeRequest):
    db_store.save_scheme(req.user_id, req.scheme_id)
    return {"status": "success"}

@app.delete("/api/saved-schemes/{user_id}/{scheme_id}")
async def delete_saved_scheme(user_id: str, scheme_id: int):
    db_store.unsave_scheme(user_id, scheme_id)
    return {"status": "success"}

@app.get("/api/saved-schemes/{user_id}")
async def fetch_saved_schemes(user_id: str):
    schemes = db_store.get_saved_schemes(user_id)
    return {"saved_schemes": schemes}

@app.post("/api/recommend")
async def recommend_schemes(req: RecommendRequest):
    user_profile = req.profile
    lang = req.lang
    evaluated_schemes = []
    
    for i, scheme in enumerate(SCHEMES):
        match_percentage, reasons, is_eligible = evaluate_scheme(user_profile, scheme)
        
        # Build the scheme object for the frontend
        evaluated_scheme = {
            "id": scheme.get("id", i), # fallback to loop index if no ID
            "name": scheme.get("name", "Unknown Scheme"),
            "type": scheme.get("type", "Unknown"),
            "loanType": scheme.get("loanType", "Unknown"),
            "maxLimit": scheme.get("maxLimit", "N/A"),
            "interest": scheme.get("interest", "N/A"),
            "match": match_percentage,
            "reasons": reasons,
            "isEligible": is_eligible,
            "documents": scheme.get("base_documents", []) if is_eligible else []
        }
        evaluated_schemes.append(evaluated_scheme)
        
    # Sort by highest match first
    evaluated_schemes.sort(key=lambda x: x["match"], reverse=True)
    
    # Translate if not English
    if lang != "en":
        try:
            API_KEY = os.environ.get("GEMINI_API_KEY")
            client = genai.Client(api_key=API_KEY)
            
            prompt = f"""
            You are a JSON translation API. Translate the following array of scheme objects into the language code '{lang}' (e.g. 'hi' = Hindi).
            Translate ONLY the 'name', 'type', 'loanType', and all 'reasons[].text' fields. Do not change any structure, keys, or numbers.
            Return ONLY raw valid JSON, no markdown blocks, no other text.
            JSON payload:
            {json.dumps(evaluated_schemes)}
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            reply = response.text.strip()
            if reply.startswith("```json"):
                reply = reply[7:]
            if reply.endswith("```"):
                reply = reply[:-3]
                
            evaluated_schemes = json.loads(reply.strip())
        except Exception as e:
            print(f"Translation failed: {e}")
            # Silently fallback to English if translation fails to prevent breaking the UI
    
    return {"schemes": evaluated_schemes}

@app.post("/api/interest")
async def register_interest(req: InterestRequest):
    print(f"User {req.user_name} ({req.user_email}) is interested in {req.scheme_name}")
    
    try:
        # Fetch actual partner email from Supabase
        # For this hackathon demo, we just get the first safe partner (or you can add location logic later)
        partner_email = "partner@mockbank.com" # default fallback
        try:
            response = supabase.table("partners").select("contact_email").eq("simulated", True).limit(1).execute()
            if response.data and len(response.data) > 0:
                partner_email = response.data[0]["contact_email"]
        except Exception as db_err:
            print("Failed to fetch partner from DB:", db_err)

        payload = {
            "name": req.user_name,
            "email": req.user_email,
            "phone": "Not Provided",
            "scheme": req.scheme_name,
            "income": 250000,
            "scheme_recommended": req.scheme_name,
            "project_cost": 500000,
            "emi": 10258,
            "nearest_partner_email": partner_email
        }
        resp = requests.post(N8N_WEBHOOK_URL, json=payload)
        resp.raise_for_status()
    except Exception as e:
        print("Failed to send to n8n:", e)
        # We don't raise an exception here so the frontend still succeeds

    return {"status": "success", "message": "Interest registered successfully. Email pending n8n activation."}

@app.post("/api/search")
async def natural_language_search(req: SearchRequest):
    query = req.query.lower()
    print(f"Searching for: {query}")
    
    # Placeholder for LLM integration. 
    # In the future, send this query to OpenAI/Gemini to match against the schemes CSV.
    
    # Mock intelligent response based on keywords
    if "education" in query or "study" in query:
        return {"matched_schemes": [3]} # State Education Loan Concession
    elif "small" in query or "micro" in query or "dairy" in query:
        return {"matched_schemes": [1]} # Micro Finance
    elif "manufacturing" in query or "factory" in query or "large" in query:
        return {"matched_schemes": [2]} # Term Loan
    
    # Default to all if no specific keywords matched
    return {"matched_schemes": [1, 2]}

@app.post("/api/chat")
async def chat_with_ai(req: ChatRequest):
    user_message = req.message
    print(f"Chat received: {user_message}")
    
    API_KEY = os.environ.get("GEMINI_API_KEY")
    
    system_instruction = f"""
    You are an expert AI Scheme Assistant for the SchemeMatcher platform in India. 
    Your goal is to help marginalized entrepreneurs find financial support.
    Here is the JSON list of all available schemes and their rules: 
    {json.dumps(SCHEMES)}
    
    Be concise, friendly, and directly tell the user which scheme they might be eligible for based on their query.
    If they don't provide enough info (like income or project type), ask them nicely.
    Keep responses to 2-3 short sentences.
    """
    
    try:
        # Initialize Gemini Client
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        reply = response.text
    except Exception as e:
        print(f"Gemini API failed (Key might be invalid or proxy needed): {e}")
        print("Falling back to Mock AI for Hackathon safety.")
        # Fallback Mock logic
        user_message_lower = user_message.lower()
        if "loan" in user_message_lower or "money" in user_message_lower or "finance" in user_message_lower:
            reply = "I see you are looking for financial assistance. Based on the schemes in our database, you might be eligible for Micro Credit Finance or a Term Loan. Have you updated your project cost in your profile?"
        elif "education" in user_message_lower or "study" in user_message_lower:
            reply = "For education purposes, we have State Education Loan Concessions. Make sure you select 'Education' as your project type in the onboarding form to see your eligibility."
        elif "dairy" in user_message_lower or "agriculture" in user_message_lower or "farm" in user_message_lower:
            reply = "Agriculture and dairy businesses are highly supported! The Micro Credit Finance scheme provides up to ₹1,40,000 for these types of projects."
        else:
            reply = "I am an AI Scheme Assistant. I can help you understand which schemes you are eligible for based on your income, caste, and project type. What kind of business are you planning?"
        
    return {"reply": reply}

# Mock endpoint for n8n Workflow 2: Deadline Tracking & Alerts
@app.get("/api/schemes/expiring-soon")
async def get_expiring_schemes():
    # Return mock users who have deadlines approaching
    return {
        "users": [
            {
                "email": "user1@example.com",
                "name": "Rajesh Kumar",
                "scheme": "NSFDC Micro Credit Finance",
                "days_left": 5
            },
            {
                "email": "user2@example.com",
                "name": "Anita Singh",
                "scheme": "State Education Loan Concession",
                "days_left": 2
            }
        ]
    }

# Mock endpoint for n8n Workflow 3: Partner NPA Risk Refresh
@app.get("/api/partners/risk-refresh")
async def get_partner_risk_refresh():
    # Return mock partner data updates
    return {
        "updates": [
            {
                "partner_id": "P-001",
                "name": "SBI Branch A",
                "npa_status": "Safe",
                "contact_email": "branch_a@sbi.mock"
            },
            {
                "partner_id": "P-002",
                "name": "Bank of Baroda Branch B",
                "npa_status": "High Risk",
                "contact_email": "branch_b@bob.mock"
            }
        ]
    }
