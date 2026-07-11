const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello. FlyRank'
  });
});

app.get('/status', (req, res) => {
  res.json ({
    status: 'ok'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});