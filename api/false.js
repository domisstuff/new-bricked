const express = require('express');
const app = express();

app.get('/false', (req, res) => {
  res.json(false);
});

const port = 3001;
app.listen(port);
