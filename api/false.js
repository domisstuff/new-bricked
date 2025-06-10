const express = require('express');
const app = express();

app.get('/false-endpoint', (req, res) => {
  res.json(false);
});

const port = 3001;
app.listen(port);
