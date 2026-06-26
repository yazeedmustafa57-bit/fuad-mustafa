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
  'imasdk.googleapis.com',
];

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const mod = parsed.protocol === 'https:' ? https : http;
      const req = mod.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        timeout: 12000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    } catch (e) {
      reject(e);
    }
  });
}

function stripAds(html) {
  if (!html) return html;
  for (const domain of AD_DOMAINS) {
    const escaped = domain.replace(/\./g, '\\.');
    const regex = new RegExp('<script[^>]*src=["\'][^"\']*' + escaped + '[^"\']*["\'][^>]*>\\s*<\\/script>', 'gi');
    html = html.replace(regex, '');
  }
  html = html.replace(/<iframe[^>]*>\s*<\/iframe>/gi, '');
  html = html.replace(/<script>[\s\S]*?(?:\.open\(|popup|popunder)[\s\S]*?<\/script>/gi, '');
  html = html.replace(/onclick\s*=\s*["']window\.open[^"']*["']/gi, 'onclick=""');
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

  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  const serverIdx = parseInt(server) || 0;
  const source = EMBED_SOURCES[serverIdx] || EMBED_SOURCES[0];
  const targetUrl = source.url(parseInt(id), type);

  try {
    console.log('Fetching:', targetUrl);
    const result = await fetchUrl(targetUrl);

    if (result.status !== 200) {
      const nextServer = (serverIdx + 1) % EMBED_SOURCES.length;
      return res.redirect(302, `/api/proxy?id=${id}&type=${type}&server=${nextServer}`);
    }

    let cleanHtml = stripAds(result.body);

    cleanHtml = cleanHtml.replace('</head>',
      '<script>try{var w=window;Object.defineProperty(w,"top",{value:w});Object.defineProperty(w,"parent",{value:w})}catch(e){}</script></head>'
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(cleanHtml);
  } catch (err) {
    console.error('Proxy error:', err.message);
    const nextServer = (serverIdx + 1) % EMBED_SOURCES.length;
    res.redirect(302, `/api/proxy?id=${id}&type=${type}&server=${nextServer}`);
  }
}
