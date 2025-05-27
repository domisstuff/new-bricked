import express from 'express'
import { config } from 'dotenv'
import { Redis } from '@upstash/redis'

config()

const app = express()
const port = 3000

const redisUrl = process.env.UPSTASH_REDIS_URL
const redisToken = process.env.UPSTASH_REDIS_TOKEN

if (!redisUrl || !redisToken) {
  console.error('Missing Redis URL or Token in environment variables')
  process.exit(1)
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
})

app.get('/count-pages', async (req, res) => {
  try {
    const keys = await redis.keys('*')
    if (!keys || keys.length === 0) return res.json({ count: 0 })

    let count = 0
    for (const key of keys) {
      const value = await redis.get(key)
      if (typeof value === 'string' && value.includes('page')) count++
    }

    res.json({ count })
  } catch (err) {
    console.error('Error in /count-pages:', err)
    res.status(500).json({ error: err.message || 'Unknown error' })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
