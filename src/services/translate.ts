// Übersetzungs-Service für Badini Kurdisch
const BADINI_API_URL = 'https://translator-site-five.vercel.app/api/translate';

interface CacheEntry {
  [key: string]: string;
}

let apiKey = localStorage.getItem('badini_api_key') || '';

export function setBadiniKey(key: string) {
  apiKey = key;
  localStorage.setItem('badini_api_key', key);
}

export function getBadiniKey(): string {
  return apiKey;
}

// Einfacher localStorage-Cache
function getCache(): CacheEntry {
  try {
    return JSON.parse(localStorage.getItem('krd_cache') || '{}');
  } catch { return {}; }
}

function setCache(key: string, value: string) {
  const cache = getCache();
  cache[key] = value;
  // Max 500 Einträge im Cache
  const entries = Object.entries(cache);
  if (entries.length > 500) {
    entries.slice(0, 100).forEach(([k]) => delete cache[k]);
  }
  try {
    localStorage.setItem('krd_cache', JSON.stringify(cache));
  } catch { /* Cache voll, ignorieren */ }
}

export async function translateToBadini(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  if (text.length < 3) return text; // Keine kurzen Texte übersetzen
  
  const cacheKey = `krd:${text}`;
  const cache = getCache();
  if (cache[cacheKey]) return cache[cacheKey];
  
  // Fallback: Einfaches Mapping für häufige Wörter
  const commonMap: Record<string, string> = {
    'House of the Dragon': 'ماڵی ئەژدیها',
    'The Bear': 'ورچەکە',
    'FROM': 'لە',
    'Movie': 'فیلم',
    'TV': 'زنجیرە',
    'Season': 'وەرز',
    'Episode': 'بەش',
    'Action': 'ئەکشن',
    'Comedy': 'کۆمیدیا',
    'Drama': 'دراما',
    'Horror': 'تۆقێنەر',
    'Thriller': 'هەستبزوێن',
    'Romance': 'ڕۆمانس',
    'Adventure': 'سەرکێشی',
    'Fantasy': 'خەیاڵی',
    'Animation': 'ئەنیمەیشن',
    'Crime': 'تەحماوی',
    'Documentary': 'بەڵگەنامەیی',
    'War': 'جەنگ',
    'History': 'مێژوو',
    'Music': 'میوزیک',
    'Mystery': 'نهێنی',
    'Science Fiction': 'خەیاڵی زانستی',
  };
  
  if (commonMap[text]) {
    setCache(cacheKey, commonMap[text]);
    return commonMap[text];
  }
  
  // Wenn API-Key vorhanden, echte Übersetzung
  if (apiKey) {
    try {
      const res = await fetch(BADINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ text, from: 'en', to: 'krd' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setCache(cacheKey, data.translatedText);
          return data.translatedText;
        }
      }
    } catch { /* Fallback */ }
  }
  
  // Ohne API-Key: Originaltext zurückgeben
  return text;
}

export async function translateBatch(texts: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const text of texts) {
    result[text] = await translateToBadini(text);
  }
  return result;
}
