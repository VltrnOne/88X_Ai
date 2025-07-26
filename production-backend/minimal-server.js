const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'VLTRN API is running!',
    timestamp: new Date().toISOString(),
    url: req.url 
  }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Minimal server listening on port ${port}`);
}); 