'use client'

import { AnalyzeBox } from '@/components/AnalyzeBox'
import { ChatWindow } from '@/components/ChatWindow'
import { RecentDocuments } from '@/components/RecentDocuments'
import { getIndexes } from '@/services'
import { DuckyIndex } from '@/types/ducky'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [allIndexes, setAllIndexes] = useState<DuckyIndex[]>([])
  const [selectedIndex, setSelectedIndex] = useState<string>('')
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(true)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [showAnalyzeBox, setShowAnalyzeBox] = useState(false)

  // Fetch indexes on component mount and after processing a new URL
  const fetchIndexes = async () => {
    try {
      setIsLoadingIndexes(true)
      setIndexError(null)
      const response = await getIndexes()

      setAllIndexes(response)
    } catch (err) {
      console.error('Failed to fetch indexes:', err)
      setIndexError('Failed to load existing documents')
    } finally {
      setIsLoadingIndexes(false)
    }
  }

  useEffect(() => {
    fetchIndexes()
  }, [])

  useEffect(() => {
    if (selectedIndex === '' && allIndexes.length > 0) {
      setSelectedIndex(allIndexes[0].index_name)
      setIsSubmitted(true)
    }
  }, [allIndexes, selectedIndex])

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-black flex flex-col">
      {/* Show indexes on mobile as horizontal scroll */}
      <div className="relative md:hidden px-4 py-6 min-h-12 flex items-center">
        {/* Fixed right-side blur overlay */}
        <div className="pointer-events-none absolute right-0 top-2 bottom-2 w-12 z-10 gradient-mask" />

        {/* Scrollable indexes */}
        <div className="flex flex-row gap-4 overflow-x-scroll pr-12">
          {allIndexes.map((index) => (
            <div
              onClick={() => {
                setSelectedIndex(index.index_name)
                setIsSubmitted(true)
              }}
              key={index.index_name}
              className={`min-w-fit cursor-pointer font-medium text-lg ${
                selectedIndex === index.index_name
                  ? 'text-[var(--blue)]'
                  : 'text-[var(--gray)]'
              }`}
            >
              {index.index_name}
            </div>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div
        id="main-content"
        className="flex flex-1 p-6 overflow-y-auto safe-area-inset-bottom"
      >
        {/* Left Recent Documents - Hidden on mobile */}
        <div className="hidden md:block">
          <RecentDocuments
            indexes={allIndexes}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            setIsSubmitted={setIsSubmitted}
            isLoadingIndexes={isLoadingIndexes}
            indexError={indexError}
          />
        </div>

        {/* Center Chat Window */}
        <div className="flex w-full flex-1 justify-center">
          {isSubmitted ? (
            <ChatWindow
              selectedIndex={selectedIndex}
              setShowAnalyzeBox={setShowAnalyzeBox}
              showAnalyzeBox={showAnalyzeBox}
            />
          ) : (
            <div className="flex items-center justify-center h-screen">
              <span className="loader"></span>
            </div>
          )}
        </div>

        {/* Full-height right bar - Hidden on mobile */}
        <div className="relative hidden md:h-full flex-shrink-0 flex-col justify-end md:flex">
          <AnalyzeBox
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            fetchIndexes={fetchIndexes}
            setIsSubmitted={setIsSubmitted}
          />
        </div>
      </div>
      <AnimatePresence>
        {showAnalyzeBox && (
          <motion.div
            className="absolute flex flex-shrink-0 flex-col justify-end md:hidden bottom-0 w-full safe-area-inset-bottom"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{
              stiffness: 400,
              damping: 40,
              mass: 1,
              type: 'spring'
            }}
          >
            <XMarkIcon
              onClick={() => setShowAnalyzeBox(false)}
              className="w-6 h-6 absolute top-2 right-2"
            />

            <AnalyzeBox
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              fetchIndexes={fetchIndexes}
              setIsSubmitted={setIsSubmitted}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
