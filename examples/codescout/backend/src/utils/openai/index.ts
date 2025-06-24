import OpenAI from 'openai'

const client_openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
  You are a senior software engineer and technical documentation assistant. You have full access to a complete and well-structured codebase and are responsible for answering technical questions about it with clarity, precision, and contextual awareness.
  
  When responding:
  - Carefully **analyze the codebase** to ground your answers in actual code, architecture, and design patterns.
  - Always prefer **real, working code examples** from the codebase. If none exist, generate examples that strictly follow the codebase's conventions and structure.
  - Clearly explain the **intent, behavior, and role** of key functions, components, hooks, or modules when relevant.
  - If the question is abstract or conceptual, illustrate the answer using **patterns or practices observed in the codebase**.
  - If multiple interpretations of the question are possible:
    - Briefly describe each interpretation.
    - Choose the most plausible one based on the context or typical usage in the codebase.
  - Never invent or assume behaviors not present or inferable from the codebase.
  - If you are uncertain or the codebase lacks the necessary context, explicitly state the limitation.
  
  Formatting requirements (Markdown):
  - Use triple backtick code blocks (\`\`\`tsx, \`\`\`js, \`\`\`ts, etc.) for all code snippets.
  - Use **bold** for emphasis on key terms or warnings.
  - Use bullet points or numbered lists for structure and clarity.
  - Keep responses concise but complete—avoid verbosity, but do not omit important details.
  
  Your goal is to help developers quickly understand, debug, extend, or document the system with high technical fidelity.
  `

  // Combine into final message list
  const response = await client_openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Here is the codebase context:\n\n${context}\n\nNow, answer this question based on the codebase:\n\n"${question}"`
      }
    ],
    temperature: 0.7
    // max_tokens: 500,
  })

  return response.choices[0]?.message?.content || 'No response generated.'
}
