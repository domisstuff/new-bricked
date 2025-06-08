import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

const AUTH_TOKEN = 'love4M@x';

const players = {};

function checkAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (token === AUTH_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/players/:id', (req, res) => {
  const id = req.params.id;
  if (!players[id]) {
    return res.status(404).json({ error: 'Player not found' });
  }
  res.json(players[id]);
});

app.post('/players/:id/change', checkAuth, (req, res) => {
  const id = req.params.id;
  if (!players[id]) {
    return res.status(404).json({ error: 'Player not found' });
  }
  Object.assign(players[id], req.body);
  res.json({ success: true, data: players[id] });
});

app.post('/players/:id', (req, res) => {
  const id = req.params.id;
  players[id] = players[id] || {
    chatlogs: [],
    accountCreationDate: null,
    banned: false,
  };
  Object.assign(players[id], req.body);
  res.json({ success: true, data: players[id] });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
