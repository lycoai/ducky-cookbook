import { NextResponse } from "next/server"

const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY
const BROWSERLESS_API_URL = "https://chrome.browserless.io/content"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!BROWSERLESS_API_KEY) {
      throw new Error("Browserless API key is not configured")
    }

    // Call Browserless API
    const response = await fetch(BROWSERLESS_API_URL + "?token=" + BROWSERLESS_API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        url,
        waitFor: 2000, // Wait for 2 seconds to ensure content is loaded
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        viewport: {
          width: 1920,
          height: 1080
        },
        rejectResourceTypes: ["image", "media", "font"] // Skip loading unnecessary resources
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Browserless API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      throw new Error(`Browserless API error: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Basic HTML to text conversion
    const content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
      .replace(/<[^>]+>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim() // Remove leading/trailing whitespace

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error scraping content:", error)
    return NextResponse.json(
      {
        error:
          "Failed to scrape content from URL. The site may be blocking automated access or the scraping service may be temporarily unavailable."
      },
      { status: 500 }
    )
  }
}
