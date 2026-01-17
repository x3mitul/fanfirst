import os
from dotenv import load_dotenv

# Load env
load_dotenv('../.env.local')
load_dotenv('../.env')

import google.generativeai as genai
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print("Testing Gemini API...")

# Try with flash
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content('Say hello in one sentence')
    print(f"✅ gemini-2.0-flash works! Response: {response.text[:100]}")
except Exception as e:
    print(f"❌ gemini-2.0-flash failed: {e}")

# Try with pro
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content('Say hello in one sentence')
    print(f"✅ gemini-pro works! Response: {response.text[:100]}")
except Exception as e:
    print(f"❌ gemini-pro failed: {e}")
