// /api/battery/connection/post.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  global.postData = req.body;

  // Call the GET endpoint via fetch
  const url = new URL(req.headers.host ? `https://${req.headers.host}/api/battery/connection/get` : 'http://localhost:3000/api/battery/connection/get');

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    res.status(200).json({ message: 'POST received, GET called', getData: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
