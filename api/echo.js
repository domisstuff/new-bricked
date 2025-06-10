const express = require('express');
const app = express();

app.use(express.json());

app.post('/echo', (req, res) => {
  if (req.body['content-pro'] !== undefined) {
    res.json(req.body['content-pro']);
  } else {
    res.status(400).json({ error: 'Missing content-pro in request body' });
  }
});

const port = 3000;
app.listen(port);
