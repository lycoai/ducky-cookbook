import { env } from './config/env'
import express from 'express'
import cors from 'cors'
import routes from './routes'

const app = express()
const PORT = env.PORT

app.use(cors())
app.use(express.json())
app.use('/', routes)

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`)
})
