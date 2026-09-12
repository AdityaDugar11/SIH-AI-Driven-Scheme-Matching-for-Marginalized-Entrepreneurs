import os
import glob
import json
import time
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

base_dir = "/home/adityadugar/Documents/sih/archive (2)"
output_file = "/home/adityadugar/Documents/sih/backend/schemes.json"

all_files = glob.glob(os.path.join(base_dir, "**", "*.txt"), recursive=True)
print(f"Found {len(all_files)} files to process.")

# Load existing so we don't restart from 0 if it fails
if os.path.exists(output_file):
    with open(output_file, 'r') as f:
        schemes_db = json.load(f)
else:
    schemes_db = []

processed_files = {s.get("source_file") for s in schemes_db if "source_file" in s}

batch_size = 5
batch = []

prompt_template = """
I have {count} text files containing descriptions of Indian government schemes.
I need you to extract the structured information from them and return a SINGLE JSON array of objects.
Do not output any markdown formatting like ```json, just output the raw JSON array.

Each object must follow this exact structure:
{{
    "name": "Scheme Name",
    "type": "Central" or "State" (infer from context or folder),
    "loanType": "Micro Finance" or "Term Loan" or "Education Loan" etc,
    "maxLimit": "₹..." (e.g. "₹5,00,000"),
    "interest": "..." (e.g. "5%"),
    "rules": {{
        "max_income": integer (extract if mentioned, otherwise omit),
        "caste_required": ["SC", "ST", "OBC", "General"] (extract if mentioned, otherwise omit),
        "gender_required": "Female" or "Male" (extract if mentioned, otherwise omit),
        "max_project_cost": integer (extract if mentioned, otherwise omit),
        "project_type": string (e.g. "Agriculture", "Education", extract if mentioned)
    }},
    "base_documents": ["Aadhaar", "Income Certificate", ...] (infer basic ones),
    "source_file": "filename"
}}

Here are the text files:
{content}
"""

def process_batch(batch_files):
    content = ""
    for f in batch_files:
        with open(f, 'r', errors='ignore') as file:
            content += f"\n--- START FILE: {os.path.basename(f)} ---\n"
            content += file.read()
            content += f"\n--- END FILE: {os.path.basename(f)} ---\n"
            
    prompt = prompt_template.format(count=len(batch_files), content=content)
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
            
        parsed = json.loads(text_response)
        return parsed
    except Exception as e:
        print(f"Error processing batch: {e}")
        return None

count = 0
for filepath in all_files:
    if os.path.basename(filepath) in processed_files:
        continue
        
    batch.append(filepath)
    if len(batch) >= batch_size:
        print(f"Processing batch of {batch_size}... ({count}/{len(all_files)})")
        results = process_batch(batch)
        if results:
            # Inject source_file just in case the AI missed it
            for i, r in enumerate(results):
                if i < len(batch):
                    r["source_file"] = os.path.basename(batch[i])
            schemes_db.extend(results)
            # Save incrementally
            with open(output_file, 'w') as f:
                json.dump(schemes_db, f, indent=4)
        
        batch = []
        # Sleep to respect rate limits (15 RPM -> 1 request every 4 seconds)
        time.sleep(4)
    count += 1

# Process remainder
if batch:
    results = process_batch(batch)
    if results:
        schemes_db.extend(results)
        with open(output_file, 'w') as f:
            json.dump(schemes_db, f, indent=4)

print(f"Finished processing! Saved {len(schemes_db)} schemes to {output_file}")
