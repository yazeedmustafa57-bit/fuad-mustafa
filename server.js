const http = require('http');
const fs = require('fs');
const path = require('path');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json',
  '.ico': 'image/x-icon'
};
const server = http.createServer((req, res) => {
  let filePath = path.join('/root/fuad-mustafa/dist', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile('/root/fuad-mustafa/dist/index.html', (err2, data2) => {
        if (err2) { res.writeHead(500); res.end('Error'); return; }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data2);
      });
      return;
    }
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    res.end(data);
  });
});
server.listen(5174, '0.0.0.0', () => console.log('Server ready on :5174'));
