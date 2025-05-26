export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({ error: "Missing username" })
    }

    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, "")
    if (!cleanUsername) {
      return res.status(400).json({ error: "Invalid username" })
    }

    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    if (!kvUrl || !kvToken) {
      return res.status(500).json({ error: "Redis environment variables not configured" })
    }

    const keys = [`page:${cleanUsername}`, `meta:${cleanUsername}`]

    const deleteResults = await Promise.all(
      keys.map(async (key) => {
        const response = await fetch(`${kvUrl}/delete/${encodeURIComponent(key)}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${kvToken}`,
            "Content-Type": "application/json",
          },
        })
        return { key, success: response.ok }
      })
    )

    const failures = deleteResults.filter(r => !r.success)

    if (failures.length > 0) {
      return res.status(500).json({
        error: "Failed to delete some keys",
        details: failures,
      })
    }

    return res.status(200).json({ success: true, message: "Page deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    return res.status(500).json({
      error: "Failed to delete page",
      details: error.message,
    })
  }
}
