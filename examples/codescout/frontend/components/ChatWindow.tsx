import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { z } from 'zod'
import { useChat } from '../hooks/useChat'

// Define schema for form validation
const questionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty')
})

type QuestionFormData = z.infer<typeof questionSchema>

interface ChatWindowProps {
  selectedIndex: string
  showAnalyzeBox: boolean
  setShowAnalyzeBox: (show: boolean) => void
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
          key={part}
          language={language}
          style={oneDark}
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}
        >
          {code} LEONEL
        </SyntaxHighlighter>
      )
    }

    return (
      <p key={index} className="whitespace-pre-wrap mb-2 last:mb-0 w-full">
        {part.trim()}
      </p>
    )
  })
}

export function ChatWindow({
  selectedIndex,
  setShowAnalyzeBox,
  showAnalyzeBox
}: Readonly<ChatWindowProps>) {
  const { messages, isLoading, sendMessage } = useChat({
    indexName: selectedIndex
  })
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: ''
    }
  })

  const handleQuestionSubmit = async (data: QuestionFormData) => {
    questionForm.setValue('question', '')
    await sendMessage(data.question)
  }

  const mockMessages = [
    {
      id: '1750789947966',
      type: 'user',
      content: 'how can i format a date in ptbr?'
    },
    {
      id: '1750789957932',
      type: 'assistant',
      content:
        "In the provided codebase context, it seems that there are locale-specific formatting files for different regions like `ar-MA`, `ar-DZ`, and `ar-SA` under the `src/locale` directory. However, there is no specific locale for Portuguese (ptbr) mentioned in the directories provided.\n\nTo format a date in Portuguese (ptbr), you would typically need a locale file specifically for Portuguese in the codebase. This locale file would contain the necessary formatting rules and patterns for dates in the Portuguese language.\n\nIf the codebase does not currently support Portuguese (ptbr) in the provided directories, you may need to create a new locale directory for Portuguese and add a `formatLong` file within that directory. This `formatLong` file would define how dates should be formatted in the Portuguese locale.\n\nHere's a conceptual example of how you might structure a Portuguese locale file for date formatting:\n\n### src/locale/pt-BR/_lib/formatLong/index.ts\n\n```typescript\nconst formats = {\n  date: {\n    fullDate: 'dd/MM/yyyy',\n    longDate: 'dd MMMM yyyy',\n    mediumDate: 'dd MMM yyyy',\n    shortDate: 'dd/MM/yy',\n  },\n  time: {\n    fullTime: 'HH:mm:ss',\n    longTime: 'HH:mm:ss z',\n    mediumTime: 'HH:mm:ss',\n    shortTime: 'HH:mm',\n  },\n};\n\nexport default formats;\n```\n\nAfter adding this locale file for Portuguese (ptbr), you can then use it in the codebase to format dates according to Portuguese formatting rules."
    },
    {
      id: '4124124',
      type: 'user',
      content: 'how can i test whatea m,asn flkansf'
    },
    {
      id: '1241241',
      type: 'assistant',
      content: 'testkjbn;jbbmn jiabsni;gbasilgb blajsg auh gjlah sulh vl'
    }
  ]

  const chatStarted = mockMessages.length > 0

  console.log(messages)

  return (
    <div className="flex max-w-[644px] flex-1 flex-col justify-center overflow-hidden gap-10">
      {/* Chat Messages Area */}
      <div className={`${chatStarted ? 'flex-1 overflow-y-auto pt-6' : ''}`}>
        <div>
          {chatStarted ? (
            <div>
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[540px] w-full rounded-2xl text-white gap-4 ${message.type === 'user' ? 'bg-[#FFFFFF24] px-4 py-3 mb-4' : 'bg-transparent mb-8'}`}
                  >
                    <div className="whitespace-pre-wrap text-white">
                      {renderMessageContent(message.content)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Welcome message - Only shown when no messages exist
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col text-center gap-4">
                <h1 className="text-[32px] md:text-[46px] font-bold text-white leading-[115%]">
                  Explore {selectedIndex} repository
                </h1>
                <p className="text-lg text-[var(--gray)] leading-[145%]">
                  Ask questions about the repository. I can help you understand
                  implementation details, code structure, and functionality.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="mb-[-6.5px] bg-transparent">
        {/* <div className="max-w-4xl mx-auto"> */}
        <form
          onSubmit={questionForm.handleSubmit(handleQuestionSubmit)}
          className="relative mx-auto max-w-4xl"
        >
          <textarea
            {...questionForm.register('question')}
            placeholder={`Ask anything...`}
            className="max-h-[200px] min-h-[60px] w-full resize-none rounded-lg border-none bg-[#FFFFFF24] py-[18px] pr-20 pl-6 text-[18px] text-white placeholder-white/70 shadow-none transition-colors duration-[240ms] outline-none hover:bg-[#FFFFFF33] focus:bg-[#FFFFFF33] disabled:cursor-not-allowed disabled:opacity-50"
            rows={1}
            onInput={(e) => {
              const target = e.currentTarget
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 200) + 'px'
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                const currentValue = e.currentTarget.value
                if (currentValue.trim()) {
                  questionForm.handleSubmit(handleQuestionSubmit)()
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 bottom-[9px] mb-[8px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9.38592 9H4.99292"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.472 9.45802L4.00499 15.412C3.60099 15.622 3.14199 15.244 3.27199 14.807L4.99299 9.00002L3.27199 3.19302C3.14299 2.75602 3.60099 2.37802 4.00499 2.58802L15.471 8.54202C15.842 8.73502 15.842 9.26602 15.471 9.45902L15.472 9.45802Z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </form>
      </div>

      <span
        onClick={() => setShowAnalyzeBox(!showAnalyzeBox)}
        className="text-white text-lg font-medium leading-[145%] underline decoration-auto underline-offset-auto text-center md:hidden"
      >
        Analyze your document
      </span>
    </div>
  )
}
