// publish.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { username, files } = req.body

    if (!username || !files || !files["index.html"]) {
      return res.status(400).json({ error: "Invalid data: missing username or HTML content" })
    }

    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    if (!kvUrl || !kvToken) {
      return res.status(500).json({ error: "Redis environment variables not configured" })
    }

    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, "")
    if (!cleanUsername) {
      return res.status(400).json({ error: "Invalid username: contains invalid characters" })
    }

    const key = `page:${cleanUsername}`

    try {
      const response = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        // Fix: wrap the HTML string in quotes (stringify the object with a 'value' key)
        body: JSON.stringify({ value: files["index.html"] }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Redis API error: ${response.status} ${errorText}`)
      }

      await response.json()

      const metaKey = `meta:${cleanUsername}`
      await fetch(`${kvUrl}/set/${encodeURIComponent(metaKey)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          publishedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }),
      })

      return res.status(200).json({
        success: true,
        url: `/${cleanUsername}`,
        message: "Page published successfully!",
      })
    } catch (redisError) {
      return res.status(500).json({
        error: "Failed to store in Redis",
        details: redisError.message,
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: "Failed to publish page",
      details: error.message,
    })
  }
}
