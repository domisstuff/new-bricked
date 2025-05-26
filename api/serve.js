// serve.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN

  if (!kvUrl || !kvToken) {
    return res.status(500).send(getErrorPage("Redis environment variables not configured"))
  }

  const { username } = req.query
  if (!username) {
    return res.status(400).send(get404Page("No username provided"))
  }

  const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, "")
  if (!cleanUsername) {
    return res.status(400).send(get404Page("Invalid username"))
  }

  const key = `page:${cleanUsername}`

  try {
    const response = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Redis API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Fix: access value field, not result string directly
    const htmlContent = data.result?.value ?? null

    if (!htmlContent) {
      return res.status(404).send(get404Page(cleanUsername))
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=300")
    return res.status(200).send(htmlContent)
  } catch (redisError) {
    return res.status(500).send(getErrorPage(`Redis API failed: ${redisError.message}`))
  }
}

function get404Page(username) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - bricked.lol</title>
  <style>
    /* omitted for brevity */
  </style>
</head>
<body>
  <div class="container">
    <h1>404 - Page Not Found</h1>
    <p>The page "@${username}" doesn't exist or hasn't been published yet.</p>
    <a href="/">← Back to Home</a>
  </div>
</body>
</html>`
}

function getErrorPage(errorMessage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - bricked.lol</title>
  <style>
    /* omitted for brevity */
  </style>
</head>
<body>
  <div class="container">
    <h1>Server Error</h1>
    <p>Something went wrong while loading this page.</p>
    <div class="error">${errorMessage}</div>
    <a href="/">← Back to Home</a>
  </div>
</body>
</html>`
}
