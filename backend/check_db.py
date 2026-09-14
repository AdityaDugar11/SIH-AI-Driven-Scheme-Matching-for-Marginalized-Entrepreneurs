import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = "https://givyetklwfexhjwhlqew.supabase.co"
SUPABASE_KEY = "sb_publishable_YSkDTDa2Oafn-nqocXoNVA_YiPbnFCW"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def check_db():
    try:
        # try fetching from applications
        res = supabase.table('applications').select('*').limit(1).execute()
        print("Applications table exists!", res)
    except Exception as e:
        print("Applications error:", e)

    try:
        res = supabase.table('saved_schemes').select('*').limit(1).execute()
        print("Saved schemes table exists!", res)
    except Exception as e:
        print("Saved schemes error:", e)

asyncio.run(check_db())
