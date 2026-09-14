import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = "https://givyetklwfexhjwhlqew.supabase.co"
SUPABASE_KEY = "sb_publishable_YSkDTDa2Oafn-nqocXoNVA_YiPbnFCW"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Application Functions
def apply_for_scheme(user_id, scheme_id, scheme_name, requested_amount=500000):
    # Check if already applied
    existing = supabase.table('applications').select('*').eq('user_id', user_id).eq('scheme_id', scheme_id).execute()
    if existing.data and len(existing.data) > 0:
        raise ValueError("Already applied for this scheme")
        
    new_app = {
        'user_id': user_id,
        'scheme_id': scheme_id,
        'scheme_name': scheme_name,
        'status': 'APPLIED',
        'requested_amount': requested_amount
    }
    
    result = supabase.table('applications').insert(new_app).execute()
    if not result.data:
        raise ValueError("Failed to create application")
    return result.data[0]

def get_user_applications(user_id):
    result = supabase.table('applications').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
    return result.data

# Saved Scheme Functions
def save_scheme(user_id, scheme_id):
    try:
        supabase.table('saved_schemes').insert({
            'user_id': user_id,
            'scheme_id': scheme_id
        }).execute()
    except Exception as e:
        # Ignore already saved error (typically handled by unique constraint)
        print("Save scheme warning:", e)
        pass

def unsave_scheme(user_id, scheme_id):
    supabase.table('saved_schemes').delete().eq('user_id', user_id).eq('scheme_id', scheme_id).execute()

def get_saved_schemes(user_id):
    result = supabase.table('saved_schemes').select('scheme_id').eq('user_id', user_id).execute()
    return [row['scheme_id'] for row in result.data]
