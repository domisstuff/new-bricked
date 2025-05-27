import express from 'express';
import { config } from 'dotenv';
import { Redis } from '@upstash/redis';

config();

const app = express();
const port = 3000;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

app.get('/count-pages', async (req, res) => {
  try {
    const keys = await redis.keys('*');
    let count = 0;

    for (const key of keys) {
      const value = await redis.get(key);
      if (typeof value === 'string' && value.includes('page')) {
        count++;
      }
    }

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port);
