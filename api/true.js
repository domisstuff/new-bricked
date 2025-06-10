const express = require('express');
const app = express();

app.get('/true', (req, res) => {
  res.json(true);
});

const port = 3000;
app.listen(port);
