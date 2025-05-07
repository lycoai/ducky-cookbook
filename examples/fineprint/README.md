# Fineprint Chat

A Next.js application that allows users to chat with legal documents using AI. This project demonstrates how to build a document Q&A system using Ducky.ai for semantic search and retrieval, combined with OpenAI for natural language responses.

## Features

- Document indexing and semantic search using Ducky.ai
- Natural language Q&A interface for legal documents
- Simple API endpoints for document management
- Built with Next.js, TypeScript, and modern web technologies

## Tech Stack

- **Frontend**: Next.js with React and TypeScript
- **Semantic Search**: Ducky.ai for document indexing and retrieval
- **Language Model**: OpenAI for natural language responses
- **Web Scraping**: Browserless.io for scraping content from URLs
- **Hosting**: Vercel (recommended)

## Getting Started

### Environment Setup

Before running the application, you need to set up your environment variables:

1. Copy `.env.local.example` to `.env.local`
2. Add your Ducky API credentials to the `.env.local` file
3. The application requires these environment variables to be set before it can run properly

### Running the project

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Built with [Ducky](https://www.ducky.ai)
