from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import pathlib
from typing import Dict, Set
from collections import defaultdict

app = FastAPI()

# Store completion status per session using question content hash as ID
# Format: { session_id: { question_set: set(completed_question_hashes) } }
session_completions: Dict[str, Dict[str, Set[str]]] = defaultdict(lambda: defaultdict(set))

# Enable CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("static/sce/index.html")

# SCE Quiz endpoint
@app.get("/")
async def serve_quiz():
    return FileResponse("static/sce/index.html")

@app.get("/sce")
async def serve_quiz_alt():
    return FileResponse("static/sce/index.html")

def get_question_id(question):
    """Generate a unique ID for a question based on its content"""
    return str(hash(question["question"] + str(question["choices"]) + str(question["correct"])))

@app.get("/sce/api/questions")
def se_questions(question_set: str = "genetic", session_id: str = None):
    try:
        # Load questions
        if question_set == "original":
            questions = json.load(pathlib.Path("static/questions.json").open())
        else:  # default to genetic
            questions = json.load(pathlib.Path("genetic_questions.json").open())
        
        # Add unique IDs to questions
        for q in questions:
            q["id"] = get_question_id(q)
        
        if not session_id:
            return questions

        # Get completed question IDs for this session and question set
        completed_ids = session_completions[session_id][question_set]
        
        # Separate incomplete and complete questions
        incomplete = [q for q in questions if q["id"] not in completed_ids]
        complete = [q for q in questions if q["id"] in completed_ids]
        
        # Return incomplete questions first, then complete ones
        return incomplete + complete

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Question set '{question_set}' not found")

@app.post("/sce/api/complete-question")
async def complete_question(request: Request):
    data = await request.json()
    session_id = data.get("session_id")
    question_set = data.get("question_set", "genetic")
    question_id = data.get("question_id")
    
    if not session_id or not question_id:
        raise HTTPException(status_code=400, detail="Missing session_id or question_id")
    
    # Mark question as completed
    session_completions[session_id][question_set].add(question_id)
    return {"status": "success"}

@app.post("/sce/api/reset-completion")
async def reset_completion(request: Request):
    data = await request.json()
    session_id = data.get("session_id")
    question_set = data.get("question_set", "genetic")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    # Clear completion status for the question set
    session_completions[session_id][question_set].clear()
    return {"status": "success"}
    

