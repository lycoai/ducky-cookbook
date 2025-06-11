# Ducky AI Chatbot Example

A simple chatbot application that demonstrates how to use DuckyAI for document indexing and retrieval, combined with Groq's language models for generating intelligent responses.

## Overview

This application creates a web-based chat interface where users can ask questions about indexed documents. The system uses DuckyAI to retrieve relevant context from documents and Groq's language models to generate contextual responses.

## Features

- 🤖 **Intelligent Chat Interface**: Clean, modern web-based chat UI
- 📚 **Document Indexing**: Index documents using DuckyAI for semantic search
- 🔍 **Context-Aware Responses**: Retrieve relevant document context for user queries
- 🧠 **AI-Powered Responses**: Generate responses using Groq's language models
- 🎨 **Modern UI**: Dark theme with smooth animations and responsive design

## Directory Structure

```
ducky-example/
├── app.py                  # Main FastAPI application
├── add-knowledge.py        # Script to index documents into DuckyAI
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create from .example.env)
├── .example.env           # Example environment variables file
├── README.md              # This file
├── data/
│   └── transcript.txt     # Sample document to be indexed
├── static/
│   ├── index.html         # Main chat interface HTML
│   └── styles.css         # CSS styling for the chat interface
├── __pycache__/           # Python bytecode cache
└── venv/                  # Python virtual environment (optional)
```

## Prerequisites

- Python 3.7+
- DuckyAI API key
- Groq API key

## Setup Instructions

### 1. Clone and Navigate to the Project

```bash
cd ducky-example
```

### 2. Create a Virtual Environment (Recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

Note: You might also need to install FastAPI and Uvicorn if not included:

```bash
pip install fastapi uvicorn groq
```

### 4. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .example.env .env
   ```

2. Edit `.env` and add your API keys:
   ```
   DUCKY_API_KEY=your-ducky-api-key-here
   GROQ_API_KEY=your-groq-api-key-here
   ```

### 5. Index Your Documents

Before running the chat application, you need to index your documents:

```bash
python add-knowledge.py
```

This script will:
- Load the transcript from `data/transcript.txt`
- Index it in DuckyAI under the index name "ducky-test"

### 6. Run the Application

Start the FastAPI server:

```bash
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

The application will be available at: `http://localhost:8001`

## Usage

1. Open your web browser and go to `http://localhost:8001`
2. You'll see the Ducky Chat interface
3. Type your message in the input field
4. Press Enter or click "Send" to chat with the AI
5. The AI will respond based on the indexed documents and general knowledge

## How It Works

### Document Indexing (`add-knowledge.py`)

1. **Load Environment Variables**: Reads API keys from the `.env` file
2. **Initialize DuckyAI Client**: Creates a client instance with your API key
3. **Read Document**: Loads the content from `data/transcript.txt`
4. **Index Document**: Stores the document in DuckyAI for semantic search

### Chat Application (`app.py`)

1. **Initialize Services**: Sets up FastAPI, DuckyAI, and Groq clients
2. **Serve Static Files**: Hosts the HTML/CSS chat interface
3. **Handle Chat Requests**: 
   - Receives user messages via POST `/chat`
   - Searches for relevant context using DuckyAI
   - Generates responses using Groq's language model
   - Returns AI responses as JSON

### Frontend (`static/`)

- **index.html**: Provides the chat interface with input field and message display
- **styles.css**: Modern dark theme styling with animations
- **JavaScript**: Handles user interactions and API communication

## API Endpoints

### `GET /`
- **Description**: Serves the main chat interface
- **Response**: HTML page with the chat UI

### `POST /chat`
- **Description**: Processes chat messages and returns AI responses
- **Request Body**: 
  ```json
  {
    "message": "Your question here"
  }
  ```
- **Response**: 
  ```json
  {
    "response": "AI generated response"
  }
  ```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DUCKY_API_KEY` | Your DuckyAI API key | Yes |
| `GROQ_API_KEY` | Your Groq API key | Yes |

### Customization Options

- **Index Name**: Change `index_name` in `app.py` to use a different DuckyAI index
- **Model**: Modify the Groq model in `app.py` (currently using "llama3-70b-8192")
- **Styling**: Edit `static/styles.css` to customize the chat interface appearance
- **Port**: Change the port in the uvicorn command (default: 8001)

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Make sure you've installed all dependencies
2. **API key errors**: Verify your `.env` file has the correct API keys
3. **Port conflicts**: Change the port if 8001 is already in use
4. **CORS issues**: The app allows all origins by default; adjust CORS settings in production

### Development Tips

- Use `--reload` flag with uvicorn for auto-reloading during development
- Check the browser console for JavaScript errors
- Monitor the terminal for FastAPI logs and errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is provided as an example implementation. Please check the licenses of the individual dependencies (DuckyAI, Groq, FastAPI) for their respective terms.

## Support

For issues related to:
- **DuckyAI**: Check the DuckyAI documentation
- **Groq**: Visit the Groq API documentation
- **FastAPI**: Refer to the FastAPI documentation

---

**Note**: This is an example application for demonstration purposes. For production use, consider implementing proper error handling, authentication, rate limiting, and security measures.