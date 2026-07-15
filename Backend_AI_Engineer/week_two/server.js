const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello, Task API'
  });
});

app.listen(PORT, () => {
  console.log(`Task API is running on http://localhost:${PORT}`);
});
