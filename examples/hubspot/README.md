# HubSpot CRM Slack Bot with DuckyAI

This example demonstrates how to build a Slack bot that can answer questions about your HubSpot CRM data. It uses DuckyAI for semantic search on your HubSpot data, and Groq for generating natural language responses.

## How it Works

1.  **Fetch Data**: A script (`fetch_hubspot.py`) connects to the HubSpot API to pull data about deals, contacts, companies, and their associated activities (notes, calls, meetings). It saves this data into a CSV file.
2.  **Index Data**: Another script (`add_knowledge.py`) processes the CSV file and indexes the content into a DuckyAI index. This makes the HubSpot data searchable.
3.  **Slack Bot**: A FastAPI application (`app.py`) hosts a Slack bot.
    *   When you mention the bot in a Slack channel, it takes your question.
    *   It queries the DuckyAI index to find the most relevant HubSpot data.
    *   It uses the Groq API (with Llama3) to generate a human-like answer based on the retrieved data.
    *   It posts the answer back to the Slack thread.

## Prerequisites

*   Python 3.8+
*   A HubSpot account with API access.
*   A DuckyAI account and API key.
*   A Groq account and API key.
*   A Slack workspace where you can create and install an app.
*   Docker and Docker Compose (optional, for running in containers).

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project and add the following variables.

```env
# DuckyAI
DUCKY_API_KEY="your_ducky_api_key"
DUCKY_INDEX_NAME="hubspot-crm"

# HubSpot
HUBSPOT_API_TOKEN="your_hubspot_private_app_token"

# Groq
GROQ_API_KEY="your_groq_api_key"
GROQ_MODEL_NAME="llama3-70b-8192"

# Slack
SLACK_BOT_TOKEN="your_slack_bot_token_starting_with_xoxb"
SLACK_APP_TOKEN="your_slack_app_token_starting_with_xapp"
```

**How to get the credentials:**

*   **DUCKY_API_KEY**: From your DuckyAI account dashboard.
*   **HUBSPOT_API_TOKEN**: Create a private app in your HubSpot developer account. Make sure to grant it the necessary scopes as listed in `src/fetch_hubspot.py`.
*   **GROQ_API_KEY**: From your Groq Cloud console.
*   **SLACK_BOT_TOKEN & SLACK_APP_TOKEN**:
    1.  Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app.
    2.  From the "Socket Mode" tab, enable Socket Mode. Create an app-level token with `connections:write` scope. This is your `SLACK_APP_TOKEN`.
    3.  From the "OAuth & Permissions" tab, add the following bot token scopes: `app_mentions:read`, `chat:write`, `channels:history`, `groups:history`, `im:history`, `mpim:history`.
    4.  Install the app to your workspace. The "Bot User OAuth Token" is your `SLACK_BOT_TOKEN`.
    5.  From the "Event Subscriptions" tab, enable events and subscribe to the `app_mention` bot event.
    6.  Invite the bot to a channel in your Slack workspace.

### 4. Fetch HubSpot Data

Run the script to fetch data from HubSpot and create the CSV file.

```bash
python src/fetch_hubspot.py
```

This will create `hubspot_multi_with_activities.csv` in the project root.

### 5. Index Data in DuckyAI

Run the script to index the data from the CSV into your DuckyAI index.

```bash
python src/add_knowledge.py
```

## Running the Application

### Using Python

Start the FastAPI server and the Slack bot:

```bash
uvicorn src.app:app --host 0.0.0.0 --port 8000
```

### Using Docker

Build and run the application using Docker Compose:

```bash
docker-compose up --build
```

The service will be available at `http://localhost:8000`.

## How to Use

1.  Go to the Slack channel where you invited the bot.
2.  Mention the bot and ask a question about your HubSpot data.
    For example: `@your-bot-name what's the status of the "Big Deal"?`
3.  The bot will reply in a thread with the answer.

## File Structure

```
.
├── docker-compose.yml      # Docker Compose configuration.
├── Dockerfile              # Docker configuration for the application.
├── README.md               # This file.
├── requirements.txt        # Python dependencies.
├── data/
│   └── hubspot_multi_with_activities.csv # Data fetched from HubSpot.
└── src/
    ├── add_knowledge.py    # Script to index data into DuckyAI.
    ├── app.py              # FastAPI app with the Slack bot logic.
    └── fetch_hubspot.py    # Script to fetch data from HubSpot.
```
