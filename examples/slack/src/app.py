# ── imports you already have ────────────────────────────────────────────────
import os, groq, requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from duckyai import DuckyAI

# ── NEW: slack-bolt / threading imports ─────────────────────────────────────
from slack_bolt import App as SlackApp
from slack_bolt.adapter.socket_mode import SocketModeHandler
import threading

# ── env-vars & clients (unchanged) ──────────────────────────────────────────
load_dotenv()
app       = FastAPI()
client    = DuckyAI(api_key=os.getenv("DUCKY_API_KEY"))
groq_cl   = groq.Client(api_key=os.getenv("GROQ_API_KEY"))
index     = os.getenv("DUCKY_INDEX_NAME", "ducky-test")

# ── CORS ───────────────────────────────────
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# ── FastAPI /chat endpoint (unchanged) ──────────────────────────────────────
class ChatMessage(BaseModel):
    message: str

@app.post("/chat")
async def chat(msg: ChatMessage):
    docs = client.documents.retrieve(index_name=index, query=msg.message, top_k=1)
    if docs.documents:
        ctx = " ".join(docs.documents[0].content_chunks or [])
        completion = groq_cl.chat.completions.create(
            model=os.getenv("GROQ_MODEL_NAME", "llama3-70b-8192"),
            messages=[
                {"role": "system",
                 "content": f"You are a helpful assistant.\nContext: {ctx}"},
                {"role": "user", "content": msg.message}
            ]
        )
        reply = completion.choices[0].message.content
    else:
        reply = "Sorry, I don't know how to respond yet."

    return JSONResponse({"response": reply})

# ────────────────────────────────────────────────────────────────────────────
#                Slack Bolt Socket-Mode section (new)
# ────────────────────────────────────────────────────────────────────────────
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")     # xoxb-…
SLACK_APP_TOKEN = os.getenv("SLACK_APP_TOKEN")     # xapp-1-A… with connections:write

bolt = SlackApp(token=SLACK_BOT_TOKEN)

@bolt.event("app_mention")
def handle_mention(body, say):
    event       = body["event"]
    user_text   = event["text"].split(maxsplit=1)[1]   # drop "@bot"
    thread_ts   = event.get("thread_ts") or event["ts"]

    # call our own FastAPI /chat endpoint
    try:
        resp = requests.post(
            "http://localhost:8000/chat",              # <── Updated to internal container port
            json={"message": user_text}, timeout=15
        ).json()
        answer = resp.get("response", "…")
    except Exception as exc:
        answer = f"Error calling backend: {exc}"

    say(text=answer, thread_ts=thread_ts)

# ── run Bolt in a background thread so FastAPI keeps serving ────────────────
def start_bolt():
    SocketModeHandler(bolt, SLACK_APP_TOKEN).start()

threading.Thread(target=start_bolt, daemon=True).start()