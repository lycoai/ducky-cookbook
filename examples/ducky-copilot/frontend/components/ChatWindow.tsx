import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useChat } from '@/hooks/useChat'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Define schema for form validation
const questionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
})

type QuestionFormData = z.infer<typeof questionSchema>

interface ChatWindowProps {
  selectedIndex: string
}

const renderMessageContent = (content: string) => {
  const parts = content.split(/(```[\s\S]*?```)/g)

  return parts.map((part, index) => {
    const codeMatch = part.match(/```(\w+)?\n([\s\S]*?)```/)
    if (codeMatch) {
      const language = codeMatch[1] || 'text' // fallback if no lang specified
      const code = codeMatch[2].trim()
      return (
        <SyntaxHighlighter
          key={index}
          language={language}
          style={oneDark}
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          {code} LEONEL
        </SyntaxHighlighter>
      )
    }

    return (
      <p key={index} className="whitespace-pre-wrap mb-2 last:mb-0">
        {part.trim()}
      </p>
    )
  })
}

export function ChatWindow({ selectedIndex }: ChatWindowProps) {
  const { messages, isLoading, sendMessage } = useChat({
    indexName: selectedIndex,
  })
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
    },
  })

  const handleQuestionSubmit = async (data: QuestionFormData) => {
    await sendMessage(data.question)
    questionForm.reset()
  }

  console.log('lcf messages', messages)

  return (
    <div className="flex-1 overflow-hidden bg-white flex flex-col">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {!messages.length ? (
            // Welcome message - Only shown when no messages exist
            <div className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4 max-w-lg">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Explore {selectedIndex} repository
                </h3>
                <p className="text-gray-500 text-sm">
                  Ask questions about the repository. I can help you understand
                  implementation details, code structure, and functionality.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    } rounded-2xl px-4 py-2`}
                  >
                    {/* <p className="whitespace-pre-wrap">{message.content}</p>  */}
                    {renderMessageContent(message.content)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={questionForm.handleSubmit(handleQuestionSubmit)}
            className="relative"
          >
            <textarea
              {...questionForm.register('question')}
              placeholder={`Ask anything about ${selectedIndex}...`}
              className="w-full pl-4 pr-20 py-3 bg-white border border-gray-200 rounded-2xl 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                             text-gray-900 placeholder-gray-500 transition-colors resize-none
                                             min-h-[56px] max-h-[200px]
                                             disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              disabled={isLoading}
              onInput={(e) => {
                const target = e.currentTarget
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 200) + 'px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  questionForm.handleSubmit(handleQuestionSubmit)()
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 bottom-2 mb-[6px] bg-blue-600 text-white w-10 h-10 
                                             rounded-xl hover:bg-blue-500 transition-colors
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
