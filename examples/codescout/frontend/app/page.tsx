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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`fixed z-50 transition-all duration-300 ease-in-out ${isMenuOpen ? 'left-[280px]' : 'left-4'} top-4 md:hidden`}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="relative h-6 w-6">
          {/* Hamburger menu icon */}
          <span className="absolute top-1 left-0 h-[2px] w-6 bg-white transition-all duration-300" />
          <span className="absolute top-3 left-0 h-[2px] w-6 bg-white transition-all duration-300" />
          <span className="absolute top-5 left-0 h-[2px] w-6 bg-white transition-all duration-300" />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 z-40 h-full w-[280px] transform bg-black p-4 transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Add space at the top for the menu button */}
          <div className="h-12" />

          {/* Analyze Box */}
          <div className="mb-6">
            <AnalyzeBox
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              fetchIndexes={fetchIndexes}
              setIsSubmitted={setIsSubmitted}
            />
          </div>

          {/* Recent Documents with scroll */}
          <div className="flex-1 overflow-hidden">
            <RecentDocuments
              indexes={allIndexes}
              selectedIndex={selectedIndex}
              setSelectedIndex={(index) => {
                setSelectedIndex(index)
                setIsMenuOpen(false)
              }}
              setIsSubmitted={setIsSubmitted}
              isLoadingIndexes={isLoadingIndexes}
              indexError={indexError}
            />
          </div>
        </div>
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
