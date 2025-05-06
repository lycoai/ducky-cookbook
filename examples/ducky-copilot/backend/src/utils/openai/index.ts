import OpenAI from 'openai'

const client_openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateResponse(question: string, documents: any[]) {
  // Format the documents into a single contextual string
  const context = documents
    .map((doc, i) => {
      const title = doc.title || `Document ${i + 1}`
      const content = doc.content || ''
      return `### ${title}\n\n${content}`
    })
    .join('\n\n---\n\n')

  // System prompt setting behavior
  const systemPrompt = `
You are an expert software engineer and technical documentation assistant. You have access to a complete codebase and are responsible for answering any technical questions about it.

When answering:
- Analyze the codebase carefully to provide accurate, context-aware responses.
- Include **real, working code examples** from the codebase or inspired by its patterns.
- Explain the purpose, function, and behavior of relevant code components when appropriate.
- When the question is abstract or general, relate it to actual implementation patterns from the codebase.
- If multiple interpretations are possible, briefly describe each, then select the most likely one.
- Avoid making assumptions not supported by the codebase.
- Be helpful, informative, and technically precise.

Format your response using Markdown:
- Use code blocks (\`\`\`language) for examples.
- Use **bold** for emphasis.
- Use bullet points or numbered lists for organization when needed.
`

  // Combine into final message list
  const response = await client_openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Here is the codebase context:\n\n${context}\n\nNow, answer this question based on the codebase:\n\n"${question}"`,
      },
    ],
    temperature: 0.7,
    // max_tokens: 500,
  })

  return response.choices[0]?.message?.content || 'No response generated.'
}
