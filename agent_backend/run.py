from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agents.feedback_agent import router as feedback_router
# from agents.grading_agent import router as grading_router

app = FastAPI()

# 👇 Add this block to fix CORS issues when calling from frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or use ["*"] to allow all origins (less secure)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for each agent
app.include_router(feedback_router, prefix="/feedback")
# app.include_router(grading_router, prefix="/grading")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
