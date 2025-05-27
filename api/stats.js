import express from 'express';
import { Redis } from '@upstash/redis';

const app = express();
const port = 3000;

const redis = new Redis({
  url: 'https://wise-bull-32623.upstash.io',
  token: 'AX9vAAIjcDEyZWRjNzRlNDY5NWU0OTk4YWI5ZGUwNjJhM2U3OTM4ZHAxMA',
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
