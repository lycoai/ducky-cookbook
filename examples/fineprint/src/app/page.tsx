"use client"

import { useState, useEffect } from "react"
import type { DuckyIndex } from "../lib/ducky"
import { Sidebar } from "../components/Sidebar"
import { ChatWindow } from "../components/ChatWindow"

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [indexes, setIndexes] = useState<DuckyIndex[]>([])
  const [selectedIndex, setSelectedIndex] = useState<string>("")
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(true)
  const [indexError, setIndexError] = useState<string | null>(null)

  // Fetch indexes on component mount and after processing a new URL
  const fetchIndexes = async () => {
    try {
      setIsLoadingIndexes(true)
      setIndexError(null)
      const response = await fetch("/api/document")
      if (!response.ok) {
        throw new Error("Failed to fetch indexes")
      }
      const indexList = await response.json()
      setIndexes(indexList)
    } catch (err) {
      console.error("Failed to fetch indexes:", err)
      setIndexError("Failed to load existing documents")
    } finally {
      setIsLoadingIndexes(false)
    }
  }

  useEffect(() => {
    fetchIndexes()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          indexes={indexes}
          isLoadingIndexes={isLoadingIndexes}
          indexError={indexError}
          fetchIndexes={fetchIndexes}
          setIsSubmitted={setIsSubmitted}
        />

        {/* Main Content Area */}
        {isSubmitted && <ChatWindow selectedIndex={selectedIndex} />}
      </div>
    </main>
  )
}
