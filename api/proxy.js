import https from 'https';
import http from 'http';

const EMBED_SOURCES = [
  { name: 'Server 1', url: (id, type) => `https://vidsrc.to/embed/${type}/${id}` },
  { name: 'Server 2', url: (id, type) => `https://www.2embed.skin/embed/${type}/${id}` },
  { name: 'Server 3', url: (id, type) => `https://www.2embed.cc/embed/${type}/${id}` },
];

const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'adservice.google.com', 'googletagmanager.com', 'google-analytics.com',
  'popads.net', 'popadscdn.net', 'propellerads.com', 'propellerclick.com',
  'adsterra.com', 'exoclick.com', 'adcash.com', 'onclickads.net',
  'llvpn.com', 'histats.com', 'cloudflareinsights.com',
  'imasdk.googleapis.com',
];

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const mod = targetUrl.startsWith('https') ? https : http;
      const req = mod.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        timeout: 15000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    } catch (e) { reject(e); }
  });
}

function stripAds(html) {
  if (!html) return html;

  // Schritt 1: Ad-Script-Tags mit src entfernen
  for (const domain of AD_DOMAINS) {
    const d = domain.replace(/\./g, '\\.');
    const re = new RegExp('<script[^>]*src=["\'][^"\']*' + d + '[^"\']*["\'][^>]*>\\s*<\\/script>', 'gi');
    html = html.replace(re, '');
  }

  // Schritt 2: JEDES einzelne <script></script> prüfen und nur Werbe-Scripte entfernen
  // Splitte bei </script> und prüfe jeden Block
  const parts = html.split('</script>');
  const filtered = parts.map(part => {
    const scriptIdx = part.lastIndexOf('<script');
    if (scriptIdx === -1) return part; // Kein Script in diesem Teil
    
    const scriptContent = part.substring(scriptIdx);
    // Prüfe auf Werbe-Muster
    const hasAd = /\.open\(|popup|popunder|_Hasync|Histats|window\.location|llvpn|tag\.min\.js|dataset\.zone/i.test(scriptContent);
    if (hasAd) {
      // Entferne nur dieses Script
      return part.substring(0, scriptIdx);
    }
    return part; // Behalte das Script
  });
  html = filtered.join('</script>');

  // Schritt 3: Noscript-Tracking entfernen
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');
  
  // Schritt 4: Histats-Kommentare entfernen
  html = html.replace(/<!-- Histats\.com[\s\S]*?END -->/gi, '');

  return html;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const { id, type = 'movie', server = '0' } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const serverIdx = parseInt(server) || 0;
  const source = EMBED_SOURCES[serverIdx] || EMBED_SOURCES[0];
  const targetUrl = source.url(parseInt(id), type);

  try {
    const result = await fetchUrl(targetUrl);
    if (result.status !== 200) {
      const next = (serverIdx + 1) % EMBED_SOURCES.length;
      return res.redirect(302, '/api/proxy?id=' + id + '&type=' + type + '&server=' + next);
    }

    let clean = stripAds(result.body);

    // Anti-Frame-Buster + Title
    clean = clean.replace('</head>',
      '<script>try{var w=self;Object.defineProperty(self,"top",{value:w,configurable:false});Object.defineProperty(self,"parent",{value:w,configurable:false})}catch(e){}</script></head>'
    );

        // Aufräumen: Leere Script-Reste und Kommentare
    clean = clean.replace(/<\/script>\s*<\/script>/g, '');
    clean = clean.replace(/<!-- Histats\.com[\s\S]*?END -->/g, '');
    clean = clean.replace(/\n{3,}/g, '\n\n');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(clean);
  } catch (err) {
    console.error('Proxy error:', err.message);
    const next = (serverIdx + 1) % EMBED_SOURCES.length;
    res.redirect(302, '/api/proxy?id=' + id + '&type=' + type + '&server=' + next);
  }
}
