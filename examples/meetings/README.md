# Meeting Summarizer Chatbot

This project is a meeting summarizer chatbot that uses DuckyAI to index meeting transcripts and Groq to generate chat completions. The chatbot can answer questions about the meetings based on the indexed transcripts.

## Project Structure

```
.
├── README.md
├── requirements.txt
├── .env
├── data
│   └── transcript.txt
├── src
│   ├── __init__.py
│   ├── add_knowledge.py
│   └── app.py
└── static
    ├── favicon.ico
    ├── index.html
    └── styles.css
```

- **`data/transcript.txt`**: Contains the meeting transcripts. (Configurable via `.env`)
- **`src/add_knowledge.py`**: Script to index the meeting transcripts using DuckyAI.
- **`src/app.py`**: FastAPI application that serves the chatbot API and frontend.
- **`static/`**: Contains the static files for the chatbot frontend (HTML, CSS).
- **`.env`**: Configuration file for environment variables (API keys, index name, file paths, etc.).
- **`requirements.txt`**: Lists the Python dependencies for the project.

## Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/lycoai/ducky-cookbook
    cd ducky-cookbook/examples/meetings/
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
    *(On Windows, use `venv\Scripts\activate`)*

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Set up environment variables:**
    Create a `.env` file in the project root (`/Users/apple/Dev/orgs/ekho/ducky/ducky-cookbook/examples/meetings/.env`) and add the following variables:
    ```properties
    DUCKY_API_KEY=<your_ducky_api_key>
    GROQ_API_KEY=<your_groq_api_key>
    DUCKY_INDEX_NAME=<your_ducky_index_name>
    GROQ_MODEL_NAME=<your_groq_model_name>
    TRANSCRIPT_FILE_PATH=data/transcript.txt
    ```
    Replace placeholders with your actual API keys and desired names.

## Usage

1.  **Index the meeting transcripts:**
    Ensure your virtual environment is active (`source venv/bin/activate`).
    ```bash
    python src/add_knowledge.py
    ```
2.  **Run the FastAPI application:**
    Ensure your virtual environment is active.
    ```bash
    uvicorn src.app:app --reload
    ```
3.  **Open the chatbot in your browser:**
    Navigate to `http://127.0.0.1:8000`

## Chatbot API

The chatbot exposes a POST endpoint at `/chat` that accepts a JSON payload with a "message" field:

```json
{
  "message": "What was discussed in the product strategy workshop?"
}
```

The API will respond with a JSON payload containing the chatbot's response:

```json
{
  "response": "The product strategy workshop focused on..."
}
```
