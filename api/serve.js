// Serve API - fetches raw HTML string from Redis and sends as text/html
export default async function serveHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  try {
    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    if (!kvUrl || !kvToken) {
      return res.status(500).send("Redis environment variables not configured")
    }

    const { username } = req.query
    if (!username) {
      return res.status(400).send("No username provided")
    }

    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, "")
    if (!cleanUsername) {
      return res.status(400).send("Invalid username")
    }

    const key = `page:${cleanUsername}`
    const response = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return res.status(404).send("Page not found")
    }

    // Get raw HTML string from Redis (as text)
    const htmlContent = await response.text()

    if (!htmlContent) {
      return res.status(404).send("Page not found")
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=300")
    return res.status(200).send(htmlContent)
  } catch (error) {
    return res.status(500).send("Server error")
  }
}
