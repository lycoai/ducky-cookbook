from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import pathlib

app = FastAPI()

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

@app.get("/sce/api/questions")
def se_questions(question_set: str = "genetic"):
    try:
        if question_set == "original":
            return json.load(pathlib.Path("static/questions.json").open())
        else:  # default to genetic
            return json.load(pathlib.Path("genetic_questions.json").open())
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Question set '{question_set}' not found")
    

