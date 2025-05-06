import { Ducky } from 'duckyai-ts'

const ducky = new Ducky({
  apiKey: process.env.DUCKY_API_KEY,
})

type Document = {
  content: string
  url: string
  title: string
  metadata: {
    suffix: string
    num_lines: number
    filename: string
    repository: string
  }
}

export async function batchIndex(documents: Document[], index_name: string) {
  const docsToIndex = documents
    .filter((doc) => doc.content && doc.content.trim().length > 0)
    .map((doc, index) => ({
      indexName: index_name,
      docId: `doc-${index}`,
      content: doc.content,
      title: doc.title,
      url: doc.url,
      metadata: doc.metadata,
    }))

  const chunkSize = 100
  for (let i = 0; i < docsToIndex.length; i += chunkSize) {
    const chunk = docsToIndex.slice(i, i + chunkSize)
    try {
      await ducky.documents.batchIndex({ documents: chunk })
      console.log(`📦 Indexed documents ${i + 1} to ${i + chunk.length}`)
    } catch (error) {
      console.error(
        `❌ Error indexing documents ${i + 1} to ${i + chunk.length}:`,
        error,
      )
    }
  }
}

export async function retrieveDocuments(query: string, index_name: string) {
  const result = await ducky.documents.retrieve({
    indexName: index_name,
    query: query,
    topK: 10,
    alpha: 1,
    rerank: true,
  })

  return result
}

export async function listIndexes() {
  const indexes = await ducky.indexes.list()

  return indexes
}

export async function createIndex(index_name: string) {
  const response = await ducky.indexes.create({
    indexName: index_name,
  })

  return response
}
