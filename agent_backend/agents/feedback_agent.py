from fastapi import APIRouter
from pydantic import BaseModel
from utils.bedrock_client import call_claude

router = APIRouter()

class FeedbackRequest(BaseModel):
    question: str
    answer: str

@router.post("/generate")
async def generate_feedback(req: FeedbackRequest):
    prompt = f"Evaluate the student's answer to the following question.\nQuestion: {req.question}\nAnswer: {req.answer}\nGive detailed feedback."
    result = call_claude(prompt)
    return {"feedback": result}
