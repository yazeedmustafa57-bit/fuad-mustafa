// Embed-Quellen mit Ad-reduzierenden Parametern
// Sortiert nach Zuverlässigkeit (schnellste/längste Lebensdauer zuerst)

export interface EmbedSource {
  name: string;
  url: (id: number, type: string) => string;
  testUrl?: string;
}

export const EMBED_SOURCES: EmbedSource[] = [
  {
    name: 'VidLink',
    url: (id, type) => `https://vidlink.pro/${type}/${id}`,
    testUrl: 'https://vidlink.pro',
  },
  {
    name: 'Vidsrc',
    url: (id, type) => `https://vidsrc.to/embed/${type}/${id}`,
    testUrl: 'https://vidsrc.to',
  },
  {
    name: '2Embed',
    url: (id, type) => `https://www.2embed.cc/embed/${type}/${id}`,
    testUrl: 'https://www.2embed.cc',
  },
  {
    name: 'Embed.su',
    url: (id, type) => `https://embed.su/embed/${type}/${id}`,
    testUrl: 'https://embed.su',
  },
  {
    name: 'Vidsrc.xyz',
    url: (id, type) => `https://vidsrc.xyz/embed/${type}/${id}`,
    testUrl: 'https://vidsrc.xyz',
  },
  {
    name: 'Movie-Web',
    url: (id, type) => `https://movie-web.app/media/${type}?id=${id}`,
    testUrl: 'https://movie-web.app',
  },
];

/**
 * Testet ob ein Embed-Server erreichbar ist (CORS-freier Ping)
 */
export async function testServer(source: EmbedSource): Promise<boolean> {
  if (!source.testUrl) return true;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    await fetch(source.testUrl, { mode: 'no-cors', signal: controller.signal });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

/**
 * Findet den ersten erreichbaren Server (sortiert nach Priorität)
 */
export async function findWorkingServer(
  sources: EmbedSource[] = EMBED_SOURCES
): Promise<EmbedSource | null> {
  for (const source of sources) {
    const ok = await testServer(source);
    if (ok) return source;
  }
  return null;
}

/** Maximale Wartezeit auf einen Server (ms) bevor Next-Server probiert wird */
export const PLAYER_TIMEOUT = 15000;
