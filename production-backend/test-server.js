import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'VLTRN API is running!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Test server listening on port ${port}`);
}); 