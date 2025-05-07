import { useState } from "react"

export interface ProcessDocumentResult {
  indexName: string
}

const getIndexNameFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.split(".")
    const filteredParts = parts[0] === "www" ? parts.slice(1) : parts
    const domainName = filteredParts.join("-")
    return domainName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
  } catch {
    throw new Error("Invalid URL format")
  }
}

const scrapeContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error("Failed to scrape content from URL")
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error("Error scraping content:", error)
    throw new Error("Failed to scrape content from URL")
  }
}

interface UseDocumentProcessorReturn {
  processDocument: (url: string) => Promise<ProcessDocumentResult>
  isProcessing: boolean
  error: string | null
}

export const useDocumentProcessor = (): UseDocumentProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processDocument = async (url: string): Promise<ProcessDocumentResult> => {
    try {
      setIsProcessing(true)
      setError(null)

      const indexName = getIndexNameFromUrl(url)

      const content = await scrapeContent(url)

      const response = await fetch("/api/document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          indexName,
          title: indexName,
          content,
          url
        })
      })

      if (!response.ok) {
        throw new Error("Failed to index document")
      }

      return { indexName }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process the document")
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processDocument,
    isProcessing,
    error
  }
}
