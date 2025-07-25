import http from 'http';

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Simple server is working!' }));
});

server.listen(8083, '0.0.0.0', () => {
  console.log('Simple server listening on port 8083');
}); 