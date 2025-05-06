import dotenv from 'dotenv'

dotenv.config()

if (!process.env.PORT) {
  throw new Error('PORT not defined in .env')
}

export const env = {
  PORT: process.env.PORT,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DUCKY_API_KEY: process.env.DUCKY_API_KEY,
}
