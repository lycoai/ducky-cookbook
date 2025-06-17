# LLM Slack Bot with DuckyAI & Groq

This project implements a Slack bot that uses DuckyAI for knowledge retrieval and Groq for language model responses. It can fetch Slack channel history, index it into DuckyAI, and then use this knowledge to answer questions when mentioned in Slack.

## Prerequisites

*   Python 3.11+
*   Docker and Docker Compose
*   Access to DuckyAI, Groq, and Slack APIs.

## Setup

1.  **Clone the repository (if you haven't already).**
2.  **Create an Environment File:**
    *   Copy the example environment file (if one exists) or create a new file named `.env` in the project root.
    *   Populate it with your API keys and configuration details. It should include:
        ```env
        SLACK_BOT_TOKEN=xoxb-...
        SLACK_APP_TOKEN=xapp-1-...
        CHANNEL_ID=C...
        DUCKY_API_KEY=...
        DUCKY_INDEX_NAME=your-ducky-index-name
        GROQ_API_KEY=gsk_...
        GROQ_MODEL_NAME=llama3-70b-8192
        # Optional:
        # PAGE_LIMIT=200
        # LAST_N=0
        ```
    *   **Important Slack Scopes for your Bot Token (`SLACK_BOT_TOKEN`):**
        *   `channels:history`
        *   `groups:history`
        *   `im:history`
        *   `mpim:history`
        *   `chat:write`
        *   `users:read` (to resolve user names)
    *   **Important Slack Scopes for your App Token (`SLACK_APP_TOKEN`):**
        *   `connections:write` (for Socket Mode)

## Running the Application

The application is containerized using Docker.

1.  **Build and Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    This will build the Docker image and start the service. The FastAPI application (which the Slack bot internally calls) will be available on port 8005 on your host machine, mapped to port 8000 in the container. The Slack bot will connect using Socket Mode.

## Data Ingestion (Optional - for RAG)

If you want the bot to use Slack channel history as its knowledge base:

1.  **Fetch Slack History:**
    *   Ensure your `.env` file is correctly configured, especially `SLACK_BOT_TOKEN` and `CHANNEL_ID`.
    *   Run the `fetch_slack.py` script. You can do this inside the running container or locally if your environment is set up.
    *   Example (running inside the Docker container if it's already up):
        ```bash
        docker-compose exec web python src/fetch_slack.py
        ```
    *   This will create/update `data/channel_history_enriched.json`.

2.  **Add Knowledge to DuckyAI:**
    *   Ensure your `.env` file has `DUCKY_API_KEY` and `DUCKY_INDEX_NAME`.
    *   Run the `add_knowledge.py` script.
    *   Example (running inside the Docker container):
        ```bash
        docker-compose exec web python src/add_knowledge.py
        ```
    *   This will index the content of `data/channel_history_enriched.json` into your DuckyAI index.

After these steps, the bot, when mentioned, will use the indexed Slack history to provide context-aware responses.

## How it Works

1.  **`src/app.py`:** Contains the main application logic.
    *   A **FastAPI** server provides a `/chat` endpoint. This endpoint:
        *   Receives a message.
        *   Queries **DuckyAI** for relevant context from the indexed knowledge.
        *   Sends the message and context to the **Groq LLM** for a response.
    *   A **Slack Bolt app** (using Socket Mode) listens for mentions (`@botname`).
        *   When mentioned, it calls its own FastAPI `/chat` endpoint.
        *   It then sends the LLM's reply back to the Slack channel/thread.
2.  **`src/fetch_slack.py`:** Fetches message history from a specified Slack channel and saves it to `data/channel_history_enriched.json`.
3.  **`src/add_knowledge.py`:** Indexes the data from `data/channel_history_enriched.json` into DuckyAI.
4.  **`Dockerfile` & `docker-compose.yml`:** Define how to build and run the application in a Docker container.

## Interacting with the Bot

Once the application is running and the bot is invited to a channel:
*   Mention the bot: `@your-bot-name your question here`
*   The bot will process the question and reply in the thread.
