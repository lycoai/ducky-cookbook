import { processRepository } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL')
})

type UrlFormData = z.infer<typeof urlSchema>

interface SidebarProps {
  selectedIndex: string
  setSelectedIndex: (index: string) => void
  fetchIndexes: () => Promise<void>
  setIsSubmitted: (submitted: boolean) => void
}

export function AnalyzeBox({
  setSelectedIndex,
  fetchIndexes,
  setIsSubmitted
}: Readonly<SidebarProps>) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const urlForm = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: ''
    }
  })

  const handleUrlSubmit = async (data: UrlFormData) => {
    setIsProcessing(true)
    try {
      // Clear selected index when processing new URL
      setSelectedIndex('')

      // Process the document and get the index name
      const { indexName } = await processRepository(data.url)

      // Refresh the index list
      await fetchIndexes()

      // Set the new index as selected
      setSelectedIndex(indexName)
      setIsSubmitted(true)

      // Reset the URL form
      urlForm.reset()
      setIsProcessing(false)
    } catch (err) {
      console.error(err)
      setIsProcessing(false)
      setError(
        err instanceof Error ? err.message : 'Failed to process the document'
      )
      throw err
    }
  }
  // Analyze box inside the right bar
  return (
    <div className="w-full md:w-auto flex h-full flex-col justify-between">
      {/* Built with Ducky link at the top for md+ */}
      <div className="hidden justify-end md:flex">
        <a
          href="https://www.ducky.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--gray)] transition-colors duration-[240ms] hover:text-white font-medium"
        >
          Built with Ducky 23
        </a>
      </div>
      <div
        className="w-full p-6 shadow-xl rounded-t-2xl md:rounded-2xl"
        style={{ background: 'var(--blue)', padding: 24 }}
      >
        <form onSubmit={urlForm.handleSubmit(handleUrlSubmit)}>
          <div className="mb-4 text-lg font-medium text-white">
            Load repository
          </div>
          <div className="flex flex-col space-y-4">
            <div className="relative mx-auto w-full">
              <input
                type="url"
                id="url"
                {...urlForm.register('url')}
                placeholder="Enter a URL"
                className="h-10 w-full rounded-lg border-none bg-[#FFFFFF24] px-6 pr-12 text-[15px] font-medium text-white placeholder-white/80 transition-colors duration-[240ms] outline-none hover:bg-[#FFFFFF33] focus:bg-[#FFFFFF33] md:w-[256px]"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="absolute right-[18px] bottom-[8px] flex cursor-pointer items-center justify-center border-none bg-none p-0 text-2xl text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M17.5555 12L6.44443 12"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.7778 8.22217L17.5555 11.9999L13.7778 15.7777"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-lg bg-red-900/20 p-2 text-center text-sm text-red-100">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
