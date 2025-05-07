import { NextResponse } from "next/server"
import { DuckyClient } from "../../../lib/ducky"

export async function GET() {
  try {
    const indexes = await DuckyClient.listIndexes()
    return NextResponse.json(indexes)
  } catch (error) {
    console.error("Error listing indexes:", error)
    return NextResponse.json({ error: "Failed to list indexes" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { indexName, title, content, url } = await req.json()

    // First create the index
    await DuckyClient.createIndex(indexName)

    // Then index the document
    const result = await DuckyClient.indexDocument({
      indexName,
      title,
      content,
      url
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
