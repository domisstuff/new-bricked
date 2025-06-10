export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(false);
  } else {
    res.status(405).end();
  }
}
