import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, files } = req.body;

    if (!username || !files || !files['index.html']) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Sanitize username
    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, '');
    
    if (!cleanUsername) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    // Create folder path
    const folderPath = join(process.cwd(), cleanUsername);
    
    // Create folder if it doesn't exist
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    // Write index.html
    const filePath = join(folderPath, 'index.html');
    await writeFile(filePath, files['index.html']);

    return res.status(200).json({
      success: true,
      url: `/${cleanUsername}/`,
      message: 'Page published successfully!'
    });

  } catch (error) {
    console.error('Publish error:', error);
    return res.status(500).json({ error: 'Failed to publish page' });
  }
}
