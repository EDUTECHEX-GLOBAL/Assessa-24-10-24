from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
import json
from dotenv import load_dotenv
from typing import List

load_dotenv()

# === AWS Bedrock Clients ===
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

app = FastAPI()

# === CORS Setup ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Pydantic Schemas ===
class ChatRequest(BaseModel):
    message: str
    history: List[str] = []

class AssessmentRequest(BaseModel):
    topic: str
    grade: str
    subject: str
    curriculum: str
    num_questions: int = 5

class EvaluationRequest(BaseModel):
    question: str
    selected_option: str
    correct_option: str

# === Call Mistral Model ===
def call_mistral(messages: List[dict]):
    try:
        prompt_texts = " ".join([msg["content"][0]["text"] for msg in messages])
        prompt = f"<s>[INST] {prompt_texts} [/INST]"

        body = {
            "prompt": prompt,
            "max_tokens": 3000,
            "temperature": 0.5,
            "top_p": 0.9,
            "top_k": 50
        }

        model_id = "mistral.mistral-large-2402-v1:0"

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        raw_body = response["body"].read().decode("utf-8")
        response_body = json.loads(raw_body)

        if "outputs" in response_body:
            return response_body["outputs"][0].get("text", "").strip()
        elif "completion" in response_body:
            return response_body["completion"].strip()
        elif "output" in response_body:
            return response_body["output"].strip()
        else:
            print("Unknown response structure:", response_body)
            return "No valid output found in response."

    except Exception as e:
        print(f"Error while calling Mistral model: {e}")
        return "Error occurred during model call."

# === Call LLaMA 3.3 Model for Assessment Generation ===
def call_llama(prompt: str):
    try:
        body = {
            "prompt": prompt,
            "max_gen_len": 4096,
            "temperature": 0.5,
            "top_p": 0.9
        }

        model_id = "meta.llama3-70b-instruct-v1:0"

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(body),  # must be a valid JSON string
            contentType="application/json",  # must be exactly this
            accept="application/json"        # must be exactly this
        )

        raw_body = response["body"].read().decode("utf-8")
        response_body = json.loads(raw_body)

        # LLaMA 3 returns the text under 'generation'
        if "generation" in response_body:
            return response_body["generation"].strip()
        else:
            print("Unexpected LLaMA response format:", response_body)
            return "No valid generation output from LLaMA."

    except Exception as e:
        print(f"Error while calling LLaMA model: {e}")
        return "Error occurred during LLaMA model call."

    try:
        body = {
            "prompt": prompt,
            "max_gen_len": 8192,  # you can increase based on your response length needs
            "temperature": 0.5,
            "top_p": 0.9
        }

        model_id = "meta.llama3-70b-instruct-v1:0"  # ✅ corrected model ID

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        raw_body = response["body"].read().decode("utf-8")
        response_body = json.loads(raw_body)

        # Meta LLaMA 3 usually returns a 'generation' field
        if "generation" in response_body:
            return response_body["generation"].strip()
        elif "completion" in response_body:
            return response_body["completion"].strip()
        elif "output" in response_body:
            return response_body["output"].strip()
        else:
            print("Unknown response format from LLaMA:", response_body)
            return "No valid output found in LLaMA response."

    except Exception as e:
        print(f"Error while calling LLaMA model: {e}")
        return "Error occurred during LLaMA model call."

# === Intent Detection ===
def detect_intent(message: str) -> str:
    message_lower = message.lower()
    if "generate" in message_lower and ("question" in message_lower or "quiz" in message_lower or "assessment" in message_lower):
        return "generate-assessment"
    elif "answer" in message_lower and ("is correct" in message_lower or "check" in message_lower or "evaluate" in message_lower):
        return "evaluate-answer"
    else:
        return "chat"

# === Routes ===

@app.post("/chat")
async def smart_chat(req: ChatRequest):
    intent = detect_intent(req.message)

    if intent == "generate-assessment":
        prompt = f"Create 5 MCQs on this topic: '{req.message}'. Each with 4 options and mark the correct one."
        messages = [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
        response = call_mistral(messages)
        return {"type": "assessment", "response": response}

    elif intent == "evaluate-answer":
        return {
            "type": "evaluation",
            "response": "Please use /evaluate-answer endpoint for structured evaluation."
        }

    else:  # Default Chat
        all_history = [{"role": "user", "content": [{"type": "text", "text": msg}]} for msg in req.history]
        all_history.append({"role": "user", "content": [{"type": "text", "text": req.message}]})
        response = call_mistral(all_history)
        return {"type": "chat", "response": response}

@app.post("/generate-assessment")
async def generate_assessment(req: AssessmentRequest):
    prompt = (
        f"Create {req.num_questions} multiple-choice questions for a {req.curriculum} Grade {req.grade} student "
        f"in {req.subject} on the topic '{req.topic}'. Each question should have 4 options and indicate the correct one clearly."
    )
    questions = call_llama(prompt)
    return {"questions": questions}

# @app.post("/evaluate-answer")
# async def evaluate_answer(req: EvaluationRequest):
#     if req.selected_option.strip().lower() == req.correct_option.strip().lower():
#         return {"result": "Correct!", "correct": True}
#     else:
#         return {
#             "result": f"Incorrect. The correct answer was: {req.correct_option}",
#             "correct": False
#         }
