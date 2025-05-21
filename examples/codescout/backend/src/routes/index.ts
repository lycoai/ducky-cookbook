import { Router, Request, Response } from 'express'
import { parseRepoUrl, getFileList, fetchFileContents } from '../utils/github'
import {
  batchIndex,
  createIndex,
  listIndexes,
  retrieveDocuments,
} from '../utils/ducky'
import { generateResponse } from '../utils/openai'

const router = Router()

router.post('/processRepository', async (req: Request, res: Response) => {
  const { githubUrl } = req.body

  try {
    const start = Date.now()

    console.log('🔍 Scanning all files in the repository...')
    const { owner, repo, branch } = parseRepoUrl(githubUrl)
    const fileList = await getFileList(owner, repo, branch)

    console.log(`📄 Found ${fileList.length} files to fetch.`)

    const result = (
      await Promise.all(
        fileList.map((filePath: string) =>
          fetchFileContents(owner, repo, branch, filePath),
        ),
      )
    ).filter(Boolean)

    const index_name = repo
    try {
      await createIndex(index_name)
    } catch (error) {
      console.error('error creating index', error)
    }

    try {
      await batchIndex(result, index_name)
    } catch (error) {
      console.error('error batch indexing', error)
    }

    const end = Date.now()
    const elapsedSeconds = ((end - start) / 1000).toFixed(2)
    console.log(`✅ Completed in ${elapsedSeconds} seconds.`)

    res.json({ index_name, result })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Error processing repository.' })
  }
})

router.post('/retrieveDocuments', async (req: Request, res: Response) => {
  const { query, index_name } = req.body

  const result = await retrieveDocuments(query, index_name)
  res.json(result)
})

router.get('/listIndexes', async (req: Request, res: Response) => {
  const result = await listIndexes()
  res.json(result)
})

router.post('/generateResponse', async (req: Request, res: Response) => {
  const { question, index_name } = req.body
  const response = await retrieveDocuments(question, index_name)
  const result = await generateResponse(question, response.documents)

  res.json({ answer: result })
})

export default router
