const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'dist/index.html'), (err2, data2) => {
        if (err2) { res.writeHead(500); res.end('Error'); return; }
        res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
        res.end(data2);
      });
      return;
    }
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*'});
    res.end(data);
  });
});

server.listen(5180, '0.0.0.0', async () => {
  console.log(`Server on :5180 ✓`);
  
  try {
    const localtunnel = require('localtunnel');
    const tunnel = await localtunnel({ port: 5180, subdomain: 'fuadmustafaapp1' });
    console.log(`\n🔗 Öffentliche URL: ${tunnel.url}\n`);
    console.log('Teile diesen Link! Jeder kann die App sehen.\n');
  } catch(e) {
    console.log('Tunnel failed:', e.message);
    console.log('\n📍 Lokale URL: http://192.168.1.82:5180');
  }
});
