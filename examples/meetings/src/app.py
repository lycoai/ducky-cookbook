import groq
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from duckyai import DuckyAI
from fastapi.middleware.cors import CORSMiddleware

#load environment variables
import os
from dotenv import load_dotenv
load_dotenv()


# Create an instance of the FastAPI application
app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows requests from any origin, with any method and any headers.
# For production, you might want to restrict these settings.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Mount a directory named "static" to serve static files from the "/static" path
# For example, a file at "static/styles.css" would be accessible at "/static/styles.css"
app.mount("/static", StaticFiles(directory="static"), name="static")

# Define a route for the root URL ("/") that serves an HTML page
@app.get("/", response_class=HTMLResponse)
async def read_root():
    # Open the index.html file in read mode
    with open("static/index.html", "r") as f:
        # Read the content of the HTML file
        html_content = f.read()
    # Return an HTML response with the content of index.html
    return HTMLResponse(content=html_content, status_code=200)

# Initialize the DuckyAI client using the API key from environment variables
client = DuckyAI(api_key=os.getenv("DUCKY_API_KEY"))
# Get the index name from environment variables with a fallback
index_name = os.getenv("DUCKY_INDEX_NAME", "ducky-test")

# Initialize the Groq client using the API key from environment variables
groq_client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))


# Define a Pydantic model for the chat message request body
# This ensures that the incoming JSON payload has a "message" field of type string
class ChatMessage(BaseModel):
    message: str

# Define a POST endpoint for "/chat" to handle chat messages
@app.post("/chat")
async def chat(msg: ChatMessage):
    # Retrieve relevant documents from DuckyAI based on the user's message
    results = client.documents.retrieve(
        index_name=index_name,  # The name of the DuckyAI index to search
        query=msg.message,      # The user's message to use as the search query
        top_k=1                 # Retrieve only the top 1 most relevant document
    )

    # Check if any documents were found
    if results.documents:
        # If documents are found, extract context from the first document's content_chunks
        # It joins all content_chunks into a single string.
        # If there are no content_chunks, it defaults to an empty string.
        context = " ".join(results.documents[0].content_chunks) if results.documents[0].content_chunks else ""

        # Use the Groq API to generate a chat completion (response)
        completion = groq_client.chat.completions.create(
            model=os.getenv("GROQ_MODEL_NAME", "llama3-70b-8192"),
            messages=[
            {
                "role": "system",
                "content": f"""You are a helpful assistant. 
                Always respond in markdown format.
                Use the provided context to answer questions accurately.
                For casual greetings, general conversation, or questions 
                unrelated to the context, respond naturally without referencing the context. 
                Context (use only if relevant): {context}"""
            },
            {"role": "user", "content": msg.message}
            ]
        )
        # Extract the reply from the model's response
        reply = completion.choices[0].message.content
    else:
        # If no relevant documents are found by DuckyAI, provide a default response
        reply = "Sorry, I don't know how to respond yet."

    # Return the reply as a JSON response
    return JSONResponse(content={"response": reply})