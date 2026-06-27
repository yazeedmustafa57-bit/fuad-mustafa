// Sprachdatei: Deutsch ↔ Kurdisch (Badini)
export type Language = 'de' | 'krd';

type TranslationSet = {
  [key in Language]: string;
};

const translations: Record<string, TranslationSet> = {
  // Navigation
  'nav.home': { de: 'Start', krd: 'سەرەتا' },
  'nav.sport': { de: 'Sport ⚽', krd: 'وەرزش ⚽' },
  'nav.movies': { de: 'Filme', krd: 'فیلم' },
  'nav.series': { de: 'Serien', krd: 'زنجیرە' },
  'nav.settings': { de: '🔇', krd: '🔇' },
  
  // Hero
  'hero.welcome': { de: 'Willkommen bei', krd: 'بەخێربێیت بۆ' },
  'hero.subtitle': { de: 'Stream & Watch Movies & TV Series', krd: 'فیلم و زنجیرە بینەرە' },
  'hero.movies': { de: 'Filme entdecken', krd: 'فیلم بدۆزەرەوە' },
  'hero.series': { de: 'Serien entdecken', krd: 'زنجیرە بدۆزەرەوە' },
  'hero.adblock': { de: '🔇 Werbung blockieren', krd: '🔇 ڕیکلام بلوک بکە' },
  'hero.adblock.active': { de: '✓ Werbeschutz an', krd: '✓ پاراستن چالاکە' },
  
  // Search
  'search.placeholder': { de: 'Filme & Serien suchen...', krd: 'فیلم و زنجیرە بگەرە...' },
  
  // Home
  'section.trending': { de: 'Trending', krd: 'بەناوبانگ' },
  'section.showAll': { de: 'Alle anzeigen →', krd: 'هەموو نیشان بدە →' },
  
  // Watch page
  'watch.back': { de: 'Zurück', krd: 'گەڕانەوە' },
  'watch.loading': { de: 'Player wird geladen...', krd: 'پلەیەر بار دەبێت...' },
  'watch.server': { de: 'Server:', krd: 'سێرڤەر:' },
  'watch.about': { de: 'Über', krd: 'دەربارەی' },
  
  // Settings
  'settings.title': { de: '🔇 Werbung blockieren', krd: '🔇 بلوکی ڕیکلام' },
  'settings.desc': { de: 'Mit AdGuard DNS wird Werbung auf deinem ganzen Gerät blockiert', krd: 'بە AdGuard DNS ڕیکلام لە هەموو ئامێرەکەتدا دەبلوکێت' },
  
  // DNS Banner
  'dns.title': { de: 'Werbung blockieren?', krd: 'ڕیکلام بلوک بکەم؟' },
  'dns.instruction': { de: 'Auf Android: Einstellungen → Private DNS →', krd: 'لە ئەندرۆید: ڕێکخستنەکان → Private DNS →' },
  'dns.button': { de: 'Anleitung', krd: 'ڕێنمایی' },

  // Footer
  'footer.powered': { de: 'Powered by Fuad Mustafa', krd: 'پێشکەشکراو لەلایەن Fuad Mustafa' },
  'footer.copyright': { de: '© 2024 Fuad Mustafa. All rights reserved.', krd: '© 2024 Fuad Mustafa. هەموو مافێک پارێزراوە.' },
  
  // Load more
  'load.more': { de: 'Mehr laden', krd: 'زیاتر بار بکە' },
  
  // Ad block modal
  'modal.title': { de: 'Werbeschutz aktiv!', krd: 'پاراستن چالاکە!' },
  'modal.desc': { de: 'Popup-Blocker und Ad-Blocking sind aktiv. Für kompletten Werbeschutz richte AdGuard DNS in den Einstellungen ein.', krd: 'بلوکی پەنجەرە و بلوکی ڕیکلام چالاکە. بۆ پاراستنی تەواو AdGuard DNS لە ڕێکخستنەکاندا ڕێکخە.' },
  'modal.settings': { de: 'DNS-Anleitung öffnen', krd: 'ڕێنمایی DNS بکەرەوە' },
  'modal.close': { de: 'Schließen', krd: 'داخستن' },
};

export function t(key: string, lang: Language): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  // Fallback: return the German version
  return translations[key]?.de || key;
}

export const LANGUAGES = [
  { code: 'de' as Language, label: 'Deutsch', flag: '🇩🇪' },
  { code: 'krd' as Language, label: 'Badini', flag: '🏳️' },
];

export function getLanguageLabel(code: Language): string {
  return LANGUAGES.find(l => l.code === code)?.label || code;
}
