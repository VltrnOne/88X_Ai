import express from 'express';

const app = express();
const port = 3001;

app.use(express.json());

app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Test server is working!' });
});

app.post('/parse-intent', (req, res) => {
  console.log('Parse intent endpoint called');
  res.json({ 
    targetPersona: { description: "Test" },
    financialProfile: { has: [] },
    offering: { product: "Test" },
    geographicScope: { location: "Test" },
    rawPrompt: req.body.prompt || "test"
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test server listening on port ${port}`);
}); 