from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os
import logging
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Logging config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Request model
class AIRequest(BaseModel):
    prompt: str
    mode: str  # ai-generated, pre-built, teacher-contributed

# Pre-built data
PRE_BUILT_ASSESSMENTS = {
    "math": ["Solve x in 2x + 5 = 15", "Find the area of a triangle with base 10 and height 5"],
    "science": ["Describe Newton's First Law", "Explain the process of photosynthesis"],
}

# Gemini endpoint
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GOOGLE_API_KEY}"

# Normalize user input
def clean_prompt(raw_prompt: str) -> str:
    # Remove unnecessary characters and lowercase
    prompt = raw_prompt.strip()
    prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    prompt = re.sub(r'\s+', ' ', prompt)
    return prompt.lower()

@app.post("/ai-agent/")
async def ai_agent(request: AIRequest):
    raw_prompt = request.prompt
    mode = request.mode.lower().strip()

    if not raw_prompt or not mode:
        raise HTTPException(status_code=400, detail="Prompt and mode are required.")

    logger.info(f"📢 Received request: '{raw_prompt}' | Mode: {mode}")

    try:
        cleaned_prompt = clean_prompt(raw_prompt)

        if mode == "pre-built":
            logger.info("🔍 Checking pre-built assessments...")
            subject = cleaned_prompt
            return {"response": PRE_BUILT_ASSESSMENTS.get(subject, ["❗ No pre-built questions available for this subject."])}

        elif mode == "ai-generated":
            logger.info("🧠 Processing AI-generated assessment...")

            # Gracefully handle unclear input
            if len(cleaned_prompt.split()) < 2:
                cleaned_prompt = "general knowledge"

            formatted_prompt = (
                f"Generate a detailed assessment with 5 multiple choice questions on the topic: {cleaned_prompt}. "
                "Each question must include 4 answer options, clearly highlight the correct answer, "
                "and ensure the content is appropriate for school-level students."
            )

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    GEMINI_ENDPOINT,
                    headers={"Content-Type": "application/json"},
                    json={"contents": [{"parts": [{"text": formatted_prompt}]}]},
                )

            if response.status_code != 200:
                logger.error(f"❌ Gemini API Error: {response.text}")
                raise HTTPException(status_code=500, detail="Gemini API Error")

            data = response.json()
            ai_output = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

            if not ai_output:
                raise HTTPException(status_code=500, detail="Gemini returned an empty response.")

            logger.info("✅ Successfully generated AI-based assessment.")
            return {"response": ai_output}

        elif mode == "teacher-contributed":
            return {"response": f"👩‍🏫 Teacher-created assessments for '{cleaned_prompt}' are coming soon!"}

        else:
            logger.error("❌ Invalid mode received.")
            raise HTTPException(status_code=400, detail="Invalid mode. Use 'pre-built', 'ai-generated', or 'teacher-contributed'.")

    except httpx.RequestError as e:
        logger.error(f"🌐 HTTP Error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"External API Error: {str(e)}")

    except Exception as e:
        logger.error(f"🔥 Internal Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
