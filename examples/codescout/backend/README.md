# 🦆 Ducky Copilot

Ducky Copilot is a backend service built with TypeScript and Express. It serves as the core engine for Ducky AI Copilot functionalities, enabling developers to build conversational and intelligent community tools powered by semantic search and LLMs.

---

## 🚀 Features

- ⚙️ **TypeScript-first** development with built-in type safety
- 🌐 **Express.js** for robust and scalable APIs
- 🔐 **dotenv** for clean environment configuration
- 🔄 **CORS** support for cross-origin communication
- 🧠 **duckyai-ts** for AI-powered semantic search and community tooling
- 💬 **OpenAI** for generating chat-based AI responses
- 🛠️ **Developer-friendly** setup with `ts-node-dev` and `nodemon`

---

## 🤖 AI Stack Overview

### 🧠 duckyai-ts

[🔗 Ducky Website](https://ducky.ai/)

[📘 API Documentation](https://docs.ducky.ai/docs/getting-started#/)

[`duckyai-ts`](https://www.npmjs.com/package/duckyai-ts) is a developer-centric library that provides the foundation for AI-powered **semantic search**. It allows you to:

- Index and query natural language content semantically.
- Build intelligent community and documentation tools.
- Accelerate product development with pre-built AI utilities.
- Power community experiences with contextually aware content.
- Easily connect to external sources and retrieve semantically ranked results.

It's ideal for enhancing developer experiences with smart search and retrieval mechanisms.

### 💬 OpenAI Integration

We integrate with the **OpenAI API** to generate conversational responses. The AI behaves like a chat assistant, answering questions based on context retrieved via `duckyai-ts`. This hybrid approach (semantic search + LLMs) ensures more relevant and accurate outputs.

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/lycoai/ducky-cookbook.git
cd ducky-cookbook/examples/ducky-copilot/backend
npm install 
# or
yarn install
```

## ⚙️ Env config

# GitHub token to clone private/public repositories
GITHUB_TOKEN=your-github-token

# Port where the backend will run
PORT=port number (ex: 3000)

# OpenAI API key for generating AI responses
OPENAI_API_KEY=your-openai-api-key

# Ducky API key for indexing documents using duckyai-ts
DUCKY_API_KEY=your-ducky-api-key
