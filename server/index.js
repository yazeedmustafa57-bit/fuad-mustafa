const http = require('http');
const https = require('https');
const url = require('url');

// WebSocket für Live-Zähler
let WebSocketServer;
try { WebSocketServer = require('ws').Server; } catch {}
const visitors = new Map();

// ========== PROXY: Werbefreie Video-Embeds ==========

const EMBED_SOURCES = [
  { name: 'Server 1', url: (id, type) => `https://vidsrc.to/embed/${type}/${id}` },
  { name: 'Server 2', url: (id, type) => `https://www.2embed.skin/embed/${type}/${id}` },
  { name: 'Server 3', url: (id, type) => `https://www.2embed.cc/embed/${type}/${id}` },
];

// Bekannte Werbe-Domains (Script-Tags werden entfernt)
const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'adservice.google.com', 'googletagmanager.com', 'google-analytics.com',
  'popads.net', 'popadscdn.net', 'propellerads.com', 'propellerclick.com',
  'adsterra.com', 'adsterra.net', 'exoclick.com', 'exoclick.net',
  'adcash.com', 'onclickads.net', 'recreativ.ru',
  'imasdk.googleapis.com', 'imasdk.gstatic.com',
  'adsrvr.org', 'adnxs.com', 'rubiconproject.com',
  'criteo.com', 'criteo.net', 'outbrain.com', 'taboola.com',
  'pubmatic.com', 'openx.net', 'sharethis.com',
  'crwdcntrl.net', 'moatads.com', 'rlcdn.com',
];
const AD_PATTERNS = AD_DOMAINS.map(d => d.replace(/\./g, '\\.'));

// HTML aus externer URL fetchen
function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const mod = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.path + (parsed.hash || ''),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
      },
      timeout: 15000,
    };
    const req = mod.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Werbung aus HTML entfernen
function stripAds(html, baseUrl) {
  if (!html) return html;

  // 1. Script-Tags mit Werbe-Quellen entfernen
  for (const domain of AD_DOMAINS) {
    const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      `<script[^>]*src=["'][^"']*${escaped}[^"']*["'][^>]*>\\s*<\\/script>\\s*`,
      'gi'
    );
    html = html.replace(regex, '');
  }

  // 2. Alle iframe-Tags entfernen (werden meist für Werbung genutzt) – ABER Video-Container behalten
  // Entferne iframes die keine Video-Player sind
  html = html.replace(/<iframe[^>]*>[\s]*<\/iframe>/gi, '');

  // 3. Inline-Script-Blocker: Skripte die "open", "popup", "ad" enthalten
  html = html.replace(
    /<script>[\s\S]*?(?:\.open\(|popup|popunder|\.ad\(|ad\.|advertisement|adblock)[\s\S]*?<\/script>/gi,
    ''
  );

  // 4. Bekannte Werbe-Container entfernen
  const adSelectors = [
    'id="[^"]*ads?[^"]*"', 'class="[^"]*ads?[^"]*"',
    'id="[^"]*popup[^"]*"', 'class="[^"]*popup[^"]*"',
    'id="[^"]*banner[^"]*"', 'class="[^"]*banner[^"]*"',
    'id="[^"]*overlay[^"]*"', 'class="[^"]*overlay[^"]*"',
  ];
  for (const sel of adSelectors) {
    const regex = new RegExp(
      `<div[^>]*${sel}[^>]*>\\s*<\\/div>\\s*`,
      'gi'
    );
    html = html.replace(regex, '');
  }

  // 5. Meta-Refresh und Weiterleitungs-Scripte entfernen
  html = html.replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*>/gi, '');
  html = html.replace(/window\.location\s*=/g, '//window.location =');

  // 6. onerror/onclick mit Werbe-Links entschärfen
  html = html.replace(/onclick\s*=\s*["'](?:javascript:)?window\.open[^"']*["']/gi, 'onclick=""');

  return html;
}

// ========== HTTP-Server ==========

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ===== Proxy-Endpoint =====
  if (pathname === '/proxy/video') {
    const serverIdx = parseInt(parsed.query.server) || 0;
    const mediaId = parsed.query.id;
    const mediaType = parsed.query.type || 'movie'; // movie or tv

    if (!mediaId || isNaN(parseInt(mediaId))) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing or invalid id parameter' }));
      return;
    }

    const source = EMBED_SOURCES[serverIdx] || EMBED_SOURCES[0];
    const targetUrl = source.url(parseInt(mediaId), mediaType);

    console.log(`[Proxy] Fetching: ${targetUrl}`);

    fetchUrl(targetUrl)
      .then(({ status, body }) => {
        if (status !== 200) {
          // Fallback: Direkt zum nächsten Server weiterleiten
          const fallbackIdx = (serverIdx + 1) % EMBED_SOURCES.length;
          const fallbackUrl = EMBED_SOURCES[fallbackIdx].url(parseInt(mediaId), mediaType);
          res.writeHead(302, { 'Location': `/proxy/video?id=${mediaId}&type=${mediaType}&server=${fallbackIdx}` });
          res.end();
          return;
        }

        // Werbung entfernen
        const cleanHtml = stripAds(body, targetUrl);

        // Anti-Frame-Buster: Verhindere dass die Seite das iframe verlässt
        const antiBust = `
<script>
  // Anti-Frame-Buster
  window.top !== window && (function() {
    var orig = self.self;
    Object.defineProperty(window, 'top', { value: orig, writable: false });
    Object.defineProperty(window, 'parent', { value: orig, writable: false });
    try { document.domain = document.domain; } catch(e){}
  })();
</script>`;

        const finalHtml = cleanHtml.replace('</head>', antiBust + '</head>')
          .replace('</body>', '<script>try{document.title="Fuad Mustafa - Player"}catch(e){}</script></body>');

        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': "frame-ancestors 'self' https://*.github.io https://*.onrender.com https://*.railway.app;",
          'Access-Control-Allow-Origin': '*',
        });
        res.end(finalHtml);
      })
      .catch(err => {
        console.error('[Proxy] Error:', err.message);
        // Fallback: Weiterleitung zum nächsten Server
        const fallbackIdx = (serverIdx + 1) % EMBED_SOURCES.length;
        const fallbackUrl = `/proxy/video?id=${mediaId}&type=${mediaType}&server=${fallbackIdx}`;
        res.writeHead(302, { 'Location': fallbackUrl });
        res.end();
      });
    return;
  }

  // ===== Status =====
  if (pathname === '/' || pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      online: visitors.size,
      proxy: 'Video-Proxy mit Ad-Blocking aktiv',
      endpoints: ['/proxy/video?id=ID&type=movie|tv&server=0|1|2', '/ws'],
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// ========== WebSocket (Live Counter) ==========

if (WebSocketServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  setInterval(() => {
    const now = Date.now();
    for (const [socket, data] of visitors.entries()) {
      if (now - data.lastSeen > 40000) {
        visitors.delete(socket);
        broadcastOnline();
      }
    }
  }, 15000);

  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substr(2, 8);
    visitors.set(ws, { id, lastSeen: Date.now() });
    ws.send(JSON.stringify({ type: 'online', count: visitors.size }));
    broadcastOnline();

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'ping' && visitors.has(ws)) {
          visitors.get(ws).lastSeen = Date.now();
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {}
    });

    ws.on('close', () => { visitors.delete(ws); broadcastOnline(); });
    ws.on('error', () => { visitors.delete(ws); broadcastOnline(); });
  });

  function broadcastOnline() {
    const msg = JSON.stringify({ type: 'online', count: visitors.size });
    for (const [socket] of visitors) {
      try { socket.send(msg); } catch { visitors.delete(socket); }
    }
  }
}

// ========== Start ==========

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Fuad Mustafa Server läuft auf Port ${PORT}`);
  console.log(`   Proxy: http://0.0.0.0:${PORT}/proxy/video?id=ID&type=movie&server=0`);
  console.log(`   Status: http://0.0.0.0:${PORT}/`);
});
