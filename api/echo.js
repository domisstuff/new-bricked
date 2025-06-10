export default function handler(req, res) {
  if (req.method === 'POST' && req.body?.['content-pro'] !== undefined) {
    res.status(200).json(req.body['content-pro']);
  } else {
    res.status(400).json({ error: 'Missing content-pro in request body or wrong method' });
  }
}
