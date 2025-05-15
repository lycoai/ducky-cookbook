import { generateResponse } from '@/services'
import { useState } from 'react'

interface UseChatProps {
  indexName: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
}

export function useChat({ indexName }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (question: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: question,
      }
      setMessages((prev) => [...prev, userMessage])

      // Get AI response
      const response = await generateResponse(indexName, question)

      const data = response

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.answer,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error getting response:', err)
      setError('Failed to get response. Please try again.')

      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content:
          'Sorry, I encountered an error while processing your question. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  }
}
