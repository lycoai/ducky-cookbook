from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import pathlib
import os
import jwt
from typing import Dict, Set, Optional
from collections import defaultdict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") 
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not all([SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET]):
    raise ValueError("Missing required Supabase environment variables")

# Store completion status per user using question content hash as ID
# Format: { user_id: { question_set: set(completed_question_hashes) } }
user_completions: Dict[str, Dict[str, Set[str]]] = defaultdict(lambda: defaultdict(set))

# Security
security = HTTPBearer()

# Enable CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and return user ID"""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"JWT decode error: {e}")  # Debug logging
        raise HTTPException(status_code=401, detail="Invalid token")

def optional_auth(request: Request) -> Optional[str]:
    """Optional authentication - returns user_id if authenticated, None otherwise"""
    auth_header = request.headers.get("authorization")
    if not auth_header:
        return None
    
    try:
        token = auth_header.replace("Bearer ", "")
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        return payload.get("sub")
    except Exception as e:
        print(f"Optional auth decode error: {e}")  # Debug logging
        return None

@app.get("/api/config")
async def get_config():
    """Provide Supabase configuration to frontend"""
    return {
        "supabaseUrl": SUPABASE_URL,
        "supabaseAnonKey": SUPABASE_ANON_KEY
    }

@app.get("/api/debug")
async def debug_config():
    """Debug endpoint to check environment variables"""
    return {
        "supabase_url_set": bool(SUPABASE_URL),
        "supabase_anon_key_set": bool(SUPABASE_ANON_KEY),
        "supabase_jwt_secret_set": bool(SUPABASE_JWT_SECRET),
        "supabase_url_length": len(SUPABASE_URL) if SUPABASE_URL else 0,
        "supabase_anon_key_length": len(SUPABASE_ANON_KEY) if SUPABASE_ANON_KEY else 0,
        "supabase_jwt_secret_length": len(SUPABASE_JWT_SECRET) if SUPABASE_JWT_SECRET else 0
    }

@app.get("/")
async def serve_auth():
    """Serve authentication page by default"""
    return FileResponse("static/auth.html")

@app.get("/auth")
async def serve_auth_alt():
    """Alternative route for authentication page"""
    return FileResponse("static/auth.html")

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("static/auth.html")

@app.get("/sce")
async def serve_quiz():
    """Serve quiz page - authentication handled client-side"""
    return FileResponse("static/sce/index.html")

def get_question_id(question):
    """Generate a unique ID for a question based on its content"""
    return str(hash(question["question"] + str(question["choices"]) + str(question["correct"])))

@app.get("/sce/api/questions")
def get_questions(
    question_set: str = "genetic", 
    user_id: str = Depends(verify_token)
):
    """Get questions for authenticated user"""
    try:
        # Load questions
        if question_set == "original":
            questions = json.load(pathlib.Path("static/questions.json").open())
        else:  # default to genetic
            questions = json.load(pathlib.Path("genetic_questions.json").open())
        
        # Add unique IDs to questions
        for q in questions:
            q["id"] = get_question_id(q)
        
        # Get completed question IDs for this user and question set
        completed_ids = user_completions[user_id][question_set]
        
        # Separate incomplete and complete questions
        incomplete = [q for q in questions if q["id"] not in completed_ids]
        complete = [q for q in questions if q["id"] in completed_ids]
        
        # Return incomplete questions first, then complete ones
        return incomplete + complete

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Question set '{question_set}' not found")

@app.post("/sce/api/complete-question")
async def complete_question(
    request: Request,
    user_id: str = Depends(verify_token)
):
    """Mark a question as completed for the authenticated user"""
    data = await request.json()
    question_set = data.get("question_set", "genetic")
    question_id = data.get("question_id")
    
    if not question_id:
        raise HTTPException(status_code=400, detail="Missing question_id")
    
    # Mark question as completed for this user
    user_completions[user_id][question_set].add(question_id)
    return {"status": "success"}

@app.post("/sce/api/reset-completion")
async def reset_completion(
    request: Request,
    user_id: str = Depends(verify_token)
):
    """Reset completion status for the authenticated user"""
    data = await request.json()
    question_set = data.get("question_set", "genetic")
    
    # Clear completion status for the question set for this user
    user_completions[user_id][question_set].clear()
    return {"status": "success"}

@app.get("/api/user")
async def get_user_info(user_id: str = Depends(verify_token)):
    """Get authenticated user information"""
    # Get completion stats
    genetic_completed = len(user_completions[user_id]["genetic"])
    original_completed = len(user_completions[user_id]["original"])
    
    return {
        "user_id": user_id,
        "stats": {
            "genetic_completed": genetic_completed,
            "original_completed": original_completed
        }
    }

@app.post("/api/logout")
async def logout(user_id: str = Depends(verify_token)):
    """Logout endpoint - client should handle token removal"""
    return {"status": "success", "message": "Logged out successfully"}