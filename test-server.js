const express = require('express');
const app = express();
const port = 3002;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, (err) => {
  if (err) {
    console.error('Listen error:', err);
    return;
  }
  console.log(`Test server running at http://localhost:${port}`);
});