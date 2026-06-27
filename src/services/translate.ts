// Badini Übersetzungs-Service (Gemini + Badini API)

const GEMINI_API = 'https://translator-site-five.vercel.app/api/gemini-proxy';

interface CacheStore {
  [key: string]: { text: string; time: number };
}

// API-Key verwalten
function getStoredKey(): string {
  try {
    const raw = localStorage.getItem('fuad_badini_key');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed.k || parsed || '';
  } catch { return ''; }
}

export function getApiKey(): string {
  return getStoredKey();
}

export function hasApiKey(): boolean {
  const key = getStoredKey();
  return key.length > 0 && key.startsWith('AIza');
}

export function setApiKey(key: string) {
  localStorage.setItem('fuad_badini_key', JSON.stringify({ k: key }));
}

// Cache (max 24h, max 200 Einträge)
function getCache(): CacheStore {
  try { return JSON.parse(localStorage.getItem('fuad_krd_cache') || '{}'); }
  catch { return {}; }
}

function setCache(key: string, text: string) {
  const cache = getCache();
  cache[key] = { text, time: Date.now() };
  const cutoff = Date.now() - 86400000;
  const entries = Object.entries(cache).filter(([, v]) => v.time > cutoff);
  if (entries.length > 200) entries.splice(0, entries.length - 200);
  const newCache: CacheStore = {};
  entries.forEach(([k, v]) => { newCache[k] = v; });
  try { localStorage.setItem('fuad_krd_cache', JSON.stringify(newCache)); }
  catch { /* ignore */ }
}

// Gemeinsames Wörterbuch (funktioniert OHNE API-Key)
const WORD_DICT: Record<string, string> = {
  'and': 'و', 'in': 'لە', 'to': 'بۆ', 'with': 'لەگەڵ', 'for': 'بۆ',
  'from': 'لە', 'Love': 'خۆشەویستی', 'Story': 'چیرۆک', 'World': 'جیهان',
  'Day': 'ڕۆژ', 'Night': 'شەو', 'Man': 'پیاو', 'Woman': 'ژن',
  'King': 'پاشا', 'Queen': 'شاژن', 'War': 'جەنگ', 'Peace': 'ئاشتی',
  'Life': 'ژیان', 'Death': 'مردن', 'Time': 'کات', 'Heart': 'دڵ',
  'Blood': 'خوێن', 'Fire': 'ئاگر', 'Water': 'ئاو', 'Dark': 'تاریک',
  'Light': 'ڕووناک', 'Dream': 'خەون', 'Song': 'گۆرانی', 'Secret': 'نهێنی',
  'Truth': 'ڕاستی', 'Last': 'دواهەمین', 'First': 'یەکەم', 'New': 'نوێ',
  'Old': 'کۆن', 'Great': 'مەزن', 'Good': 'باش', 'Bad': 'خراپ',
  'House': 'ماڵ', 'Home': 'ماڵەوە', 'City': 'شار', 'Sea': 'دەریا',
  'Family': 'خێزان', 'Father': 'باوک', 'Mother': 'دایک', 'Friend': 'هاوڕێ',
  'Summer': 'هاوین', 'Winter': 'زستان', 'Spring': 'بەهار',
  'The': '', 'a': '', 'an': '', 'of': '', 'the': '', 'A': '', 'An': '',
};

function simpleTranslate(text: string): string {
  const words = text.split(' ');
  const translated = words.map(w => {
    const clean = w.replace(/[^a-zA-ZäöüÄÖÜßéèêëàâùûüôîç]/g, '');
    const punct = w.replace(clean, '');
    const t = WORD_DICT[clean] || WORD_DICT[clean.toLowerCase()] || '';
    return t ? t + punct : w;
  });
  return translated.filter(Boolean).join(' ').trim() || text;
}

// Übersetzung via Gemini-Proxy
async function geminiTranslate(text: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(GEMINI_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        languageFrom: 'en',
        languageTo: 'krd',
        apiKey: apiKey,
      }),
    });
    
    clearTimeout(timeout);
    
    if (res.ok) {
      const data = await res.json();
      return data.translatedText || data.translation || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Hauptfunktion: Titel übersetzen
export async function translateTitle(text: string): Promise<string> {
  if (!text || text.length < 2) return text;
  
  const cacheKey = `krd:${text}`;
  const cache = getCache();
  if (cache[cacheKey]) return cache[cacheKey].text;
  
  const apiKey = getStoredKey();
  
  // Mit API-Key (Gemini)
  if (apiKey.startsWith('AIza')) {
    const result = await geminiTranslate(text, apiKey);
    if (result && result !== text) {
      setCache(cacheKey, result);
      return result;
    }
  }
  
  // Fallback: Wörterbuch
  const simple = simpleTranslate(text);
  if (simple !== text && simple.length > 0) {
    setCache(cacheKey, simple);
    return simple;
  }
  
  return text;
}
