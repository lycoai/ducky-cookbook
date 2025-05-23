import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { DuckyIndex } from "../lib/ducky"
import { useDocumentProcessor } from "../hooks/useDocumentProcessor"
import { useState, useEffect } from "react"
import { useIsMobile } from "../hooks/useIsMobile"

// Define schema for form validation
const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL")
})

type UrlFormData = z.infer<typeof urlSchema>

interface SidebarProps {
  selectedIndex: string
  setSelectedIndex: (index: string) => void
  indexes: DuckyIndex[]
  isLoadingIndexes: boolean
  indexError: string | null
  fetchIndexes: () => Promise<void>
  setIsSubmitted: (submitted: boolean) => void
}

export function Sidebar({
  selectedIndex,
  setSelectedIndex,
  indexes,
  isLoadingIndexes,
  indexError,
  fetchIndexes,
  setIsSubmitted
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const { processDocument, isProcessing, error } = useDocumentProcessor()

  // Set sidebar to open by default on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true)
    }
  }, [isMobile])

  const urlForm = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: ""
    }
  })

  const handleUrlSubmit = async (data: UrlFormData) => {
    try {
      // Clear selected index when processing new URL
      setSelectedIndex("")

      // Process the document and get the index name
      const { indexName } = await processDocument(data.url)

      // Refresh the index list
      await fetchIndexes()

      // Set the new index as selected
      setSelectedIndex(indexName)
      setIsSubmitted(true)

      // Reset the URL form
      urlForm.reset()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isOpen && selectedIndex && (
        <div className="fixed inset-0 z-30 bg-black/50 transition-opacity duration-300" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Toggle Button (Top Left when closed) */}
      {isMobile && !isOpen && selectedIndex && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-slate-900 shadow-lg flex items-center justify-center border-2 border-slate-700 hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7 text-slate-100"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </button>
      )}
      {/* Mobile Close Button (Top Right of sidebar when open) */}
      {isMobile && isOpen && selectedIndex && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-900 shadow-lg flex items-center justify-center border-2 border-slate-700 hover:bg-slate-800 transition-colors"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7 text-slate-100"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <motion.div
        initial={false}
        animate={{
          x: isMobile ? (selectedIndex ? (isOpen ? 0 : "-100vw") : 0) : 0,
          width: isMobile ? "100%" : "24rem"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed md:relative z-40 w-96 border-r border-slate-800 ${
          isMobile ? "bg-slate-900" : "bg-slate-900/50 backdrop-blur-sm"
        } overflow-y-auto h-full flex flex-col`}
        style={{
          boxShadow: isMobile && isOpen ? "2px 0 16px rgba(0,0,0,0.2)" : undefined
        }}
      >
        <div className="p-6 flex-1">
          {/* App Title */}
          <div className="mb-8 flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <MagnifyingGlassIcon className="h-6 w-6 text-slate-300" />
            </div>
            <h1 className="text-xl font-mono text-slate-100 tracking-tight">fineprint</h1>
          </div>

          {/* URL Input Section */}
          <div className="mb-8">
            <h3 className="text-lg font-mono text-slate-300 mb-4">Analyze Document</h3>
            <p className="text-slate-400 mb-4 leading-relaxed">Enter a URL for a legal document to analyze</p>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-red-900/10 border border-red-900/20 text-red-400 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* URL Form */}
            <form onSubmit={urlForm.handleSubmit(handleUrlSubmit)} className="mb-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="url"
                    id="url"
                    {...urlForm.register("url")}
                    placeholder="https://example.com/terms-and-conditions"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg 
                                                   focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                                   text-slate-100 placeholder-slate-500 transition-colors"
                  />
                  {urlForm.formState.errors.url && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
                      {urlForm.formState.errors.url.message}
                    </motion.p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium
                                               hover:bg-blue-500 transition-colors
                                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center space-x-2">
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      "Analyze"
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Recent Documents Section */}
          <div>
            <h3 className="text-lg font-mono text-slate-300 mb-4">Recent Documents</h3>

            {isLoadingIndexes ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : indexError ? (
              <div className="p-4 bg-red-900/10 border border-red-900/20 text-red-400 rounded-lg">{indexError}</div>
            ) : indexes.length === 0 ? (
              <div className="text-slate-500 text-center py-4">No recent documents</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {indexes.map((index) => (
                  <button
                    key={index.index_name}
                    onClick={() => {
                      setSelectedIndex(index.index_name)
                      setIsSubmitted(true)
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                                  ${
                                                    selectedIndex === index.index_name
                                                      ? "bg-blue-600 text-white"
                                                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                                  }`}
                  >
                    {index.index_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Built with Ducky - Fixed at bottom */}
        <div className="p-6 border-t border-slate-800">
          <a
            href="https://www.ducky.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-400 text-sm transition-colors block text-center"
          >
            Built with Ducky
          </a>
        </div>
      </motion.div>
    </>
  )
}
