import { NextResponse } from "next/server"
import { DuckyClient } from "../../../lib/ducky"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

export async function POST(req: Request) {
  try {
    const { indexName, question } = await req.json()

    // First, get relevant chunks from Ducky
    const duckyResponse = await DuckyClient.retrieve({
      indexName,
      query: question,
      alpha: 1,
      topK: 3 // Get top 3 chunks for better context
    })

    // Prepare context from chunks
    const context = duckyResponse.chunks.map((chunk) => chunk.content).join("\n\n")

    // Prepare the prompt for OpenAI
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that answers questions about terms and conditions documents. Use the provided context to answer questions accurately and concisely."
      },
      {
        role: "user",
        content: `Context from the document:\n\n${context}\n\nQuestion: ${question}`
      }
    ]

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API Error:", errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const result = await response.json()
    return NextResponse.json({ answer: result.choices[0].message.content })
  } catch (error) {
    console.error("Error retrieving document:", error)
    return NextResponse.json({ error: "Failed to retrieve document" }, { status: 500 })
  }
}
