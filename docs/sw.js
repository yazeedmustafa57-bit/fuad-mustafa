const CACHE = 'fuad-mustafa-v2';
const ASSETS = ['/', '/index.html'];

// Bekannte Werbe-Domains
const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'google-analytics.com', 'googletagmanager.com', 'adservice.google.com',
  'adsrvr.org', 'adnxs.com', 'rubiconproject.com', 'criteo.com',
  'criteo.net', 'outbrain.com', 'taboola.com', 'taboolasyndication.com',
  'exoclick.com', 'exoclick.net', 'popads.net', 'popadscdn.net',
  'propellerads.com', 'propellerclick.com', 'adsterra.com', 'adsterra.net',
  'trafficfactory.biz', 'clicksfly.com', 'clickadu.com', 'adf.ly',
  'adbull.com', 'adbucks.net', 'adcash.com', 'adcash.net',
  'adfoc.us', 'adk2.co', 'adk2.net', 'adreactor.com',
  'advision-webs.com', 'adzerk.net', 'bidswitch.net', 'casalemedia.com',
  'contextweb.com', 'crwdcntrl.net', 'dc-storm.com', 'demdex.net',
  'exelator.com', 'krxd.net', 'moatads.com',
  'openx.net', 'pubmatic.com', 'pubnub.com', 'quantserve.com',
  'rfihub.com', 'rlcdn.com', 'sharethis.com', 'sovrn.com',
  'spotxchange.com', 'sumo.com', 'turn.com',
  'w55c.net', 'xad.com', 'yieldmanager.com',
  'yieldmo.com', 'zemanta.com', 'zergnet.com',
  'popadz.com', 'popcash.net',
  'onclickads.net', 'onclkds.com', 'recreativ.ru',
  'vidazoo.com', 'vidible.tv', 'videoadex.com', 'videohold.com',
  'imasdk.googleapis.com',
];

let adBlockActive = true; // Standardmäßig aktiv

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
  // Allen Clients Bescheid sagen, dass AdBlock aktiv ist
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'adBlockStatus', active: true });
    });
  });
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'toggleAdBlock') {
    adBlockActive = e.data.active;
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'adBlockStatus', active: adBlockActive });
      });
    });
  }
});

self.addEventListener('fetch', e => {
  // Ad-Blocking: Requests zu Werbe-Domains blockieren
  if (adBlockActive) {
    try {
      const url = new URL(e.request.url);
      const hostname = url.hostname.toLowerCase();
      const isAd = AD_DOMAINS.some(domain => hostname.includes(domain));
      if (isAd) {
        e.respondWith(new Response('', { status: 204 }));
        return;
      }
    } catch {}
  }

  // Normales Caching
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
