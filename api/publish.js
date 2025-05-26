export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const { username, files } = req.body
    console.log("Received publish request:", { username, hasFiles: !!files })

    if (!username || !files || !files["index.html"]) {
      return res.status(400).json({ error: "Invalid data: missing username or HTML content" })
    }

    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    console.log("Environment variables check:", {
      hasKvUrl: !!kvUrl,
      hasKvToken: !!kvToken,
    })

    if (!kvUrl || !kvToken) {
      return res.status(500).json({ error: "Redis environment variables not configured" })
    }

    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, "")
    if (!cleanUsername) {
      return res.status(400).json({ error: "Invalid username: contains invalid characters" })
    }

    console.log("Storing page for username:", cleanUsername)

    const key = `page:${cleanUsername}`

    const response = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kvToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ result: files["index.html"] }), // FIXED: wrap in an object
    })

    console.log("Redis set response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Redis API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log("Redis set result:", result)

    const metaKey = `meta:${cleanUsername}`
    const metaResponse = await fetch(`${kvUrl}/set/${encodeURIComponent(metaKey)}`, {
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

    console.log("Successfully stored page in KV")

    return res.status(200).json({
      success: true,
      url: `/${cleanUsername}`,
      message: "Page published successfully!",
    })
  } catch (error) {
    console.error("Publish error:", error)
    return res.status(500).json({
      error: "Failed to publish page",
      details: error.message,
    })
  }
}
