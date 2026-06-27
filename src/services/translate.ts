// Badini Übersetzungs-Service für Filmtitel
const BADINI_API = 'https://translator-site-five.vercel.app/api/proxy';

interface CacheStore {
  [key: string]: { text: string; time: number };
}

// API-Key verwalten
export function getBadiniKey(): string {
  try {
    const data = localStorage.getItem('fuad_badini_key') || '';
    // Prüfe ob es JSON mit decrypt ist
    if (data.startsWith('{')) return JSON.parse(data).k || '';
    return data;
  } catch { return ''; }
}

export function setBadiniKey(key: string) {
  localStorage.setItem('fuad_badini_key', JSON.stringify({ k: key }));
}

export function hasBadiniKey(): boolean {
  return getBadiniKey().length > 0;
}

// Cache (max 24h)
function getCache(): CacheStore {
  try { return JSON.parse(localStorage.getItem('fuad_krd_cache') || '{}'); }
  catch { return {}; }
}

function setCache(key: string, text: string) {
  const cache = getCache();
  cache[key] = { text, time: Date.now() };
  // Alte Einträge löschen (>24h)
  const cutoff = Date.now() - 86400000;
  const entries = Object.entries(cache).filter(([, v]) => v.time > cutoff);
  if (entries.length > 200) entries.splice(0, entries.length - 200);
  const newCache: CacheStore = {};
  entries.forEach(([k, v]) => { newCache[k] = v; });
  try { localStorage.setItem('fuad_krd_cache', JSON.stringify(newCache)); }
  catch { /* ignore */ }
}

// Gemeinsame Wörterbuch-Übersetzung (funktioniert OHNE API-Key)
const WORD_DICT: Record<string, string> = {
  'The': '', 'a': '', 'an': '', 'and': 'و', 'of': '', 'in': 'لە',
  'to': 'بۆ', 'with': 'لەگەڵ', 'for': 'بۆ', 'on': 'لەسەر',
  'at': 'لە', 'by': 'لەلایەن', 'from': 'لە', 'his': '', 'her': '',
  'my': '', 'your': '', 'our': '', 'its': '', 'the': '', 'A': '', 'An': '',
  'Love': 'خۆشەویستی', 'Story': 'چیرۆک', 'World': 'جیهان', 'Day': 'ڕۆژ',
  'Night': 'شەو', 'Man': 'پیاو', 'Woman': 'ژن', 'Child': 'منداڵ',
  'King': 'پاشا', 'Queen': 'شاژن', 'Lord': 'خاوەن', 'War': 'جەنگ',
  'Peace': 'ئاشتی', 'Life': 'ژیان', 'Death': 'مردن', 'Time': 'کات',
  'Heart': 'دڵ', 'Soul': 'ڕۆح', 'Blood': 'خوێن', 'Fire': 'ئاگر',
  'Water': 'ئاو', 'Dark': 'تاریک', 'Light': 'ڕووناک', 'Shadow': 'سێبەر',
  'Dream': 'خەون', 'Song': 'گۆرانی', 'Book': 'کتێب', 'Game': 'یاری',
  'Secret': 'نهێنی', 'Truth': 'ڕاستی', 'Lies': 'درۆ',
  'Last': 'دواهەمین', 'First': 'یەکەم', 'New': 'نوێ', 'Old': 'کۆن',
  'Great': 'مەزن', 'Little': 'بچووک', 'Big': 'گەورە', 'Good': 'باش',
  'Bad': 'خراپ', 'Beautiful': 'جوان', 'Young': 'گەنج', 'Free': 'ئازاد',
  'Dead': 'مردوو', 'Alive': 'زیندوو', 'Real': 'ڕاستەقینە',
  'American': 'ئەمریکی', 'English': 'ئینگلیزی', 'French': 'فەرەنسی',
  'German': 'ئەڵمانی', 'Italian': 'ئیتاڵی', 'Spanish': 'ئیسپانی',
  'Chinese': 'چینی', 'Japanese': 'ژاپۆنی', 'Korean': 'کۆری',
  'Indian': 'هیندی', 'Arabian': 'عەرەبی', 'Turkish': 'تورکی',
  'House': 'ماڵ', 'Home': 'ماڵەوە', 'City': 'شار', 'Kingdom': 'شانشین',
  'Mountain': 'چیا', 'River': 'ڕووبار', 'Sea': 'دەریا', 'Island': 'دوورگە',
  'Forest': 'دارستان', 'Garden': 'باخ', 'Castle': 'قەڵا', 'Tower': 'بورج',
  'Bridge': 'پرد', 'Road': 'ڕێگا', 'Street': 'شەقام', 'School': 'قوتابخانە',
  'Hospital': 'نەخۆشخانە', 'Prison': 'زیندان', 'Church': 'کڵێسا',
  'Temple': 'پەرستگا', 'Hotel': 'وتێل', 'Restaurant': 'ڕێستۆرانت',
  'Summer': 'هاوین', 'Winter': 'زستان', 'Spring': 'بەهار', 'Fall': 'پاییز',
  'Morning': 'بەیانی', 'Evening': 'ئێوارە', 'Midnight': 'نیوەشەو',
  'Family': 'خێزان', 'Father': 'باوک', 'Mother': 'دایک', 'Brother': 'برا',
  'Sister': 'خوشک', 'Son': 'کوڕ', 'Daughter': 'کچ', 'Friend': 'هاوڕێ',
};

// Übersetze einzelnes Wort mit Wörterbuch
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

// Haupt-Übersetzungsfunktion
export async function translateTitle(text: string): Promise<string> {
  if (!text || text.length < 2) return text;
  
  const cacheKey = `t:${text}`;
  const cache = getCache();
  if (cache[cacheKey]) return cache[cacheKey].text;
  
  const apiKey = getBadiniKey();
  
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(BADINI_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          languageFrom: 'en',
          languageTo: 'krd',
        }),
      });
      
      clearTimeout(timeout);
      
      if (res.ok) {
        const data = await res.json();
        const translated = data.translatedText || data.translation || '';
        if (translated && translated !== text) {
          setCache(cacheKey, translated);
          return translated;
        }
      }
    } catch {
      // Fallback to simple translation
    }
  }
  
  // Fallback: Wörterbuch-Übersetzung
  const simple = simpleTranslate(text);
  if (simple !== text) {
    setCache(cacheKey, simple);
    return simple;
  }
  
  return text;
}

// Batch-Übersetzung für mehrere Titel
export async function translateTitles(titles: { id: number; title: string; type: string }[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const apiKey = getBadiniKey();
  
  // Mit API-Key: Einzeln übersetzen
  if (apiKey) {
    for (const item of titles) {
      result[`${item.type}_${item.id}`] = await translateTitle(item.title);
    }
    return result;
  }
  
  // Ohne API-Key: Wörterbuch
  for (const item of titles) {
    const t = simpleTranslate(item.title);
    result[`${item.type}_${item.id}`] = t !== item.title ? t : item.title;
  }
  return result;
}
