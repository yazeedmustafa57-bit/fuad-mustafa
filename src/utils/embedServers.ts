export interface EmbedSource {
  name: string;
  url: (id: number, type: string) => string;
  testUrl?: string;
}

/**
 * Embed-Quellen mit cleanen URLs:
 * - Erste 3 verwenden `?ad=0` oder `?no_popup=1` Parameter für weniger Werbung
 * - Die Server sind unsichtbar für Ad-Blocker-Erkennung
 */
export const EMBED_SOURCES: EmbedSource[] = [
  {
    name: 'VidLink',
    url: (id, type) => `https://vidlink.pro/${type}/${id}?ad=0`,
    testUrl: 'https://vidlink.pro',
  },
  {
    name: 'Vidsrc',
    url: (id, type) => `https://vidsrc.to/embed/${type}/${id}?no_popup=1&ads=0`,
    testUrl: 'https://vidsrc.to',
  },
  {
    name: '2Embed',
    url: (id, type) => `https://www.2embed.cc/embed/${type}/${id}?ad=0`,
    testUrl: 'https://www.2embed.cc',
  },
  {
    name: 'Embed.su',
    url: (id, type) => `https://embed.su/embed/${type}/${id}?ads=0`,
    testUrl: 'https://embed.su',
  },
  {
    name: 'Vidsrc.xyz',
    url: (id, type) => `https://vidsrc.xyz/embed/${type}/${id}?no_popup=1`,
    testUrl: 'https://vidsrc.xyz',
  },
  {
    name: 'Movie-Web',
    url: (id, type) => `https://movie-web.app/media/${type}?id=${id}`,
    testUrl: 'https://movie-web.app',
  },
];

// Cache für Server-Verfügbarkeit (eine Session lang behalten)
const availabilityCache: Map<string, boolean> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten
const cacheTimestamps: Map<string, number> = new Map();

/**
 * Testet ob ein Embed-Server erreichbar ist (CORS-frei)
 * Ergebnis wird für 5 Minuten gecached
 */
export async function testServer(source: EmbedSource): Promise<boolean> {
  // Cache prüfen
  const cached = availabilityCache.get(source.name);
  const cachedAt = cacheTimestamps.get(source.name) || 0;
  if (cached !== undefined && Date.now() - cachedAt < CACHE_DURATION) {
    return cached;
  }

  if (!source.testUrl) return true;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    await fetch(source.testUrl, { mode: 'no-cors', signal: controller.signal });
    clearTimeout(timer);
    availabilityCache.set(source.name, true);
    cacheTimestamps.set(source.name, Date.now());
    return true;
  } catch {
    availabilityCache.set(source.name, false);
    cacheTimestamps.set(source.name, Date.now());
    return false;
  }
}

/** Maximale Wartezeit auf einen Server (ms) bevor Next-Server probiert wird */
export const PLAYER_TIMEOUT = 20000; // 20 Sekunden (großzügiger für langsame Verbindungen)
