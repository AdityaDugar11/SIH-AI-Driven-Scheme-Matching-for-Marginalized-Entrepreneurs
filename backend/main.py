from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import json
from dotenv import load_dotenv
load_dotenv()

from schemes_db import SCHEMES, evaluate_scheme
from google import genai
from google.genai import types

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

# IMPORTANT: Replace with your actual n8n Webhook URL once n8n is running
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/lead-intake-12345"

@app.post("/api/recommend")
async def recommend_schemes(req: RecommendRequest):
    user_profile = req.profile
    evaluated_schemes = []
    
    for scheme in SCHEMES:
        match_percentage, reasons, is_eligible = evaluate_scheme(user_profile, scheme)
        
        # Build the scheme object for the frontend
        evaluated_scheme = {
            "id": scheme["id"],
            "name": scheme["name"],
            "type": scheme["type"],
            "loanType": scheme["loanType"],
            "maxLimit": scheme["maxLimit"],
            "interest": scheme["interest"],
            "match": match_percentage,
            "reasons": reasons,
            "isEligible": is_eligible,
            "documents": scheme["base_documents"] if is_eligible else []
        }
        evaluated_schemes.append(evaluated_scheme)
        
    # Sort by highest match first
    evaluated_schemes.sort(key=lambda x: x["match"], reverse=True)
    return {"schemes": evaluated_schemes}

@app.post("/api/interest")
async def register_interest(req: InterestRequest):
    print(f"User {req.user_name} ({req.user_email}) is interested in {req.scheme_name}")
    
    # Forward to n8n Webhook (Commented out until n8n is running to prevent errors)
    """
    try:
        payload = {
            "name": req.user_name,
            "email": req.user_email,
            "scheme_recommended": req.scheme_name,
            "project_cost": 500000, # Mock data
            "emi": 5500 # Mock data
        }
        response = requests.post(N8N_WEBHOOK_URL, json=payload)
        response.raise_for_status()
    except Exception as e:
        print("Failed to send to n8n:", e)
        # We don't raise an exception here so the frontend still succeeds
    """

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
