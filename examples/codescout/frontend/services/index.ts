interface IndexItem {
  indexName: string
}

export const getIndexes = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/listIndexes`,
  )
  if (!response.ok) {
    throw new Error('Failed to fetch indexes')
  }
  const { indexes } = await response.json()

  const filtered = indexes.map((item: IndexItem) => ({
    index_name: item.indexName,
  }))

  return filtered
}

export const processRepository = async (url: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/processRepository`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ githubUrl: url }),
    },
  )

  const data = await response.json()
  return data
}

export const generateResponse = async (indexName: string, question: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/generateResponse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index_name: indexName, question }),
    },
  )
  if (!response.ok) {
    throw new Error('Failed to generate response')
  }

  const data = await response.json()
  return data
}
