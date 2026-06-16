const http = require('http');
const fs = require('fs');
const path = require('path');

// Try to load ws library, fallback if not available
let WebSocketServer;
try {
  WebSocketServer = require('ws').Server;
} catch {
  console.log('ws library not found, install with: npm install ws');
  process.exit(1);
}

// Track online visitors
const visitors = new Map(); // socket -> { id, lastSeen }

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check & status endpoint
  if (req.url === '/' || req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      online: visitors.size,
      server: 'fuad-mustafa live counter',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server, path: '/ws' });

// Clean up disconnected visitors every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [socket, data] of visitors.entries()) {
    if (now - data.lastSeen > 40000) { // 40 seconds timeout
      visitors.delete(socket);
      broadcastOnline();
    }
  }
}, 15000);

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substr(2, 8);
  
  visitors.set(ws, { id, lastSeen: Date.now() });
  
  // Send current count to new visitor
  ws.send(JSON.stringify({ type: 'online', count: visitors.size }));

  // Broadcast to everyone
  broadcastOnline();

  // Handle heartbeat
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'ping') {
        // Update last seen
        if (visitors.has(ws)) {
          visitors.get(ws).lastSeen = Date.now();
        }
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch {}
  });

  ws.on('close', () => {
    visitors.delete(ws);
    broadcastOnline();
  });

  ws.on('error', () => {
    visitors.delete(ws);
    broadcastOnline();
  });
});

function broadcastOnline() {
  const msg = JSON.stringify({ type: 'online', count: visitors.size });
  for (const [socket] of visitors) {
    try {
      socket.send(msg);
    } catch {
      visitors.delete(socket);
    }
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Live counter server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://0.0.0.0:${PORT}/ws`);
});
