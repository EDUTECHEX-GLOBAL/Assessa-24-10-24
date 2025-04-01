from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
if not OPENAI_API_KEY:
    raise RuntimeError("❌ OpenAI API Key is missing.")
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# FastAPI app instance
app = FastAPI()

# Request model
class AIRequest(BaseModel):
    prompt: str
    mode: str  # 'ai-generated', 'pre-built', or 'teacher-contributed'

# Pre-Built Assessments (Mock)
PRE_BUILT_ASSESSMENTS = {
    "math": ["Solve x in 2x + 5 = 15", "Find the area of a triangle with base 10 and height 5"],
    "science": ["Describe Newton's First Law", "Explain the process of photosynthesis"],
}

@app.post("/ai-agent/")
async def ai_agent(request: AIRequest):
    logger.info(f"📢 Received request: {request.prompt} | Mode: {request.mode}")

    try:
        # ✅ Pre-Built Assessments
        if request.mode == "pre-built":
            subject = request.prompt.lower()
            return {"response": PRE_BUILT_ASSESSMENTS.get(subject, ["No pre-built questions available."])}

        # ✅ AI-Generated Assessments
        elif request.mode == "ai-generated":
            logger.info("🔄 Sending request to OpenAI...")
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": f"Generate an assessment on {request.prompt}"}],
                max_tokens=500,
                timeout=10  # ⏳ Timeout after 10 seconds
            )

            if not response.choices:
                logger.error("❌ OpenAI returned an empty response.")
                raise HTTPException(status_code=500, detail="OpenAI returned an empty response.")

            ai_output = response.choices[0].message.content
            logger.info(f"✅ OpenAI Response: {ai_output}")
            return {"response": ai_output}

        # ✅ Teacher-Contributed Assessments (Mocked)
        elif request.mode == "teacher-contributed":
            return {"response": f"Teacher-created assessment for {request.prompt} is not available yet."}

        # ❌ Invalid Mode Handling
        else:
            logger.error("❌ Invalid mode received.")
            raise HTTPException(status_code=400, detail="Invalid mode. Choose 'ai-generated', 'pre-built', or 'teacher-contributed'.")

    except openai.OpenAIError as e:
        logger.error(f"❌ OpenAI API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI API Error: {str(e)}")

    except Exception as e:
        logger.error(f"❌ Internal Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
