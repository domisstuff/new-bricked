import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export default async function handler(req, res) {
  const { username } = req.query

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Sanitize username
    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, "")

    if (!cleanUsername) {
      return res.status(400).json({ error: "Invalid username" })
    }

    console.log("Looking for page:", cleanUsername)

    // Get the HTML content from Redis
    const key = `page:${cleanUsername}`
    const htmlContent = await redis.get(key)

    if (!htmlContent) {
      // Return a 404 page
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Page Not Found - bricked.lol</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
              background: #0a0a0a; color: #ffffff; min-height: 100vh;
              display: flex; align-items: center; justify-content: center; padding: 2rem;
            }
            .container {
              text-align: center; max-width: 400px;
              background: rgba(255,255,255,0.02); backdrop-filter: blur(10px);
              border: 1px solid #222222; border-radius: 20px; padding: 3rem 2rem;
            }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { color: #888888; margin-bottom: 2rem; line-height: 1.6; }
            a { color: #ffffff; text-decoration: none; padding: 0.75rem 1.5rem;
                background: rgba(255,255,255,0.1); border: 1px solid #333333;
                border-radius: 8px; transition: all 0.3s ease; }
            a:hover { background: rgba(255,255,255,0.15); border-color: #ffffff; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Page Not Found</h1>
            <p>The page "@${cleanUsername}" doesn't exist or hasn't been published yet.</p>
            <a href="/">← Back to Home</a>
          </div>
        </body>
        </html>
      `)
    }

    // Set content type to HTML and return the stored content
    res.setHeader("Content-Type", "text/html")
    return res.status(200).send(htmlContent)
  } catch (error) {
    console.error("Error serving page:", error)
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - bricked.lol</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            background: #0a0a0a; color: #ffffff; min-height: 100vh;
            display: flex; align-items: center; justify-content: center; padding: 2rem;
          }
          .container {
            text-align: center; max-width: 400px;
            background: rgba(255,255,255,0.02); backdrop-filter: blur(10px);
            border: 1px solid #222222; border-radius: 20px; padding: 3rem 2rem;
          }
          h1 { font-size: 2rem; margin-bottom: 1rem; color: #ef4444; }
          p { color: #888888; margin-bottom: 2rem; line-height: 1.6; }
          a { color: #ffffff; text-decoration: none; padding: 0.75rem 1.5rem;
              background: rgba(255,255,255,0.1); border: 1px solid #333333;
              border-radius: 8px; transition: all 0.3s ease; }
          a:hover { background: rgba(255,255,255,0.15); border-color: #ffffff; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Server Error</h1>
          <p>Something went wrong while loading this page. Please try again later.</p>
          <a href="/">← Back to Home</a>
        </div>
      </body>
      </html>
    `)
  }
}
