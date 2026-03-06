from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os

app = FastAPI(title="EduVerse AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class TutorRequest(BaseModel):
    message: str
    course_context: Optional[str] = None
    conversation_history: Optional[List[dict]] = []

class GradeRequest(BaseModel):
    assignment_text: str
    rubric: Optional[str] = None
    max_score: int = 100

class RecommendRequest(BaseModel):
    user_id: str
    interests: List[str] = []
    completed_courses: List[str] = []

class PredictionRequest(BaseModel):
    student_id: str
    course_id: str
    current_progress: float
    assignment_scores: List[float] = []

# --- Services ---
from services.tutor import get_tutor_response
from services.grading import auto_grade
from services.recommendation import get_recommendations
from services.prediction import predict_performance

# --- Routes ---
@app.get("/health")
async def health():
    return {"status": "ok", "service": "EduVerse AI", "version": "1.0.0"}

@app.post("/api/tutor")
async def tutor_chat(req: TutorRequest):
    try:
        response = await get_tutor_response(req.message, req.course_context, req.conversation_history)
        return {"success": True, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/grade")
async def grade_assignment(req: GradeRequest):
    try:
        result = await auto_grade(req.assignment_text, req.rubric, req.max_score)
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend")
async def recommend_courses(req: RecommendRequest):
    try:
        recs = await get_recommendations(req.user_id, req.interests, req.completed_courses)
        return {"success": True, "recommendations": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
async def predict_student(req: PredictionRequest):
    try:
        result = await predict_performance(req.student_id, req.course_id, req.current_progress, req.assignment_scores)
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
