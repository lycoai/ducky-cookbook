'use client'

import { useState, useEffect } from 'react'
import { DuckyIndex } from '@/types/ducky'
import { ChatWindow } from '@/components/ChatWindow'
import { getIndexes } from '@/services'
import { AnalyzeBox } from '@/components/AnalyzeBox'
import { RecentDocuments } from '@/components/RecentDocuments'

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [allIndexes, setAllIndexes] = useState<DuckyIndex[]>([])
  const [selectedIndex, setSelectedIndex] = useState<string>('')
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(true)
  const [indexError, setIndexError] = useState<string | null>(null)

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
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="pt-4 flex justify-center md:hidden">
        <a
          href="https://www.ducky.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--gray)] transition-colors duration-[240ms] hover:text-white"
        >
          Built with Ducky
        </a>
      </div>
      {/* Main Content */}
      <div className="flex h-screen p-[40px]">
        {/* Full-height left bar - Hidden on mobile */}
        <div className="relative hidden h-full flex-shrink-0 flex-col justify-end md:flex">
          <AnalyzeBox
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            fetchIndexes={fetchIndexes}
            setIsSubmitted={setIsSubmitted}
          />
        </div>

        {/* Center Chat Window */}
        <div className="flex w-full flex-1 justify-center px-2">
          {isSubmitted && <ChatWindow selectedIndex={selectedIndex} />}
        </div>

        {/* Right Recent Documents - Hidden on mobile */}
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
      </div>
    </main>
  )
}
