// Sprachdatei: Deutsch ↔ Kurdisch (Badini) – KOMPLETT
export type Language = 'de' | 'krd';

type TranslationSet = Record<string, string>;
type TranslationDict = Record<string, TranslationSet>;

const translations: TranslationDict = {
  // ===== Navigation =====
  'nav.home': { de: 'Start', krd: 'سەرەتا' },
  'nav.sport': { de: 'Sport ⚽', krd: 'وەرزش ⚽' },
  'nav.movies': { de: 'Filme', krd: 'فیلم' },
  'nav.series': { de: 'Serien', krd: 'زنجیرە' },
  'nav.settings': { de: '🔇', krd: '🔇' },

  // ===== Hero =====
  'hero.welcome': { de: 'Willkommen bei', krd: 'بەخێربێیت بۆ' },
  'hero.title': { de: 'Fuad Mustafa', krd: 'فوئاد مستەفا' },
  'hero.subtitle': { de: 'Stream & Watch Movies & TV Series', krd: 'فیلم و زنجیرە بینەرە' },
  'hero.movies': { de: 'Filme entdecken', krd: 'فیلم بدۆزەرەوە' },
  'hero.series': { de: 'Serien entdecken', krd: 'زنجیرە بدۆزەرەوە' },
  'hero.adblock': { de: '🔇 Werbung blockieren', krd: '🔇 ڕیکلام بلوک بکە' },
  'hero.adblock.active': { de: '✓ Werbeschutz an', krd: '✓ پاراستن چالاکە' },

  // ===== Search =====
  'search.placeholder': { de: 'Filme & Serien suchen...', krd: 'فیلم و زنجیرە بگەرە...' },

  // ===== Section =====
  'section.trending': { de: 'Trending', krd: 'بەناوبانگ' },
  'section.popular': { de: 'Beliebt', krd: 'بەناوبانگ' },
  'section.toprated': { de: 'Top bewertet', krd: 'باشترین هەڵسەنگاندن' },
  'section.showAll': { de: 'Alle anzeigen →', krd: 'هەموو نیشان بدە →' },
  'section.loadMore': { de: 'Mehr laden', krd: 'زیاتر بار بکە' },
  'section.noResults': { de: 'Keine Ergebnisse gefunden', krd: 'هیچ ئەنجامێک نەدۆزرایەوە' },
  'section.searchResults': { de: 'Suchergebnisse für', krd: 'ئەنجامی گەڕان بۆ' },

  // ===== Watch Page =====
  'watch.back': { de: 'Zurück', krd: 'گەڕانەوە' },
  'watch.loading': { de: 'Player wird geladen...', krd: 'پلەیەر بار دەبێت...' },
  'watch.server': { de: 'Server:', krd: 'سێرڤەر:' },
  'watch.server1': { de: 'Server 1', krd: 'سێرڤەر ١' },
  'watch.server2': { de: 'Server 2', krd: 'سێرڤەر ٢' },
  'watch.server3': { de: 'Server 3', krd: 'سێرڤەر ٣' },
  'watch.about': { de: 'Über', krd: 'دەربارەی' },
  'watch.seasons': { de: 'Staffeln', krd: 'وەرزەکان' },
  'watch.runtime': { de: 'min', krd: 'خولەک' },
  'watch.hour': { de: 'h', krd: 'ک' },

  // ===== Media Types =====
  'media.movie': { de: 'FILM', krd: 'فیلم' },
  'media.series': { de: 'SERIE', krd: 'زنجیرە' },
  'media.season': { de: 'Staffel', krd: 'وەرز' },

  // ===== AdBlock Modal =====
  'modal.title': { de: 'Werbeschutz aktiv!', krd: 'پاراستن چالاکە!' },
  'modal.desc': { de: 'Popup-Blocker und Ad-Blocking sind aktiv. Für kompletten Werbeschutz auf dem ganzen Gerät richte AdGuard DNS in den Einstellungen ein.', krd: 'بلوکی پەنجەرە و بلوکی ڕیکلام چالاکە. بۆ پاراستنی تەواو AdGuard DNS لە ڕێکخستنەکاندا ڕێکخە.' },
  'modal.settings': { de: 'DNS-Anleitung öffnen', krd: 'ڕێنمایی DNS بکەرەوە' },
  'modal.close': { de: 'Schließen', krd: 'داخستن' },

  // ===== DNS/AdBlock Banner =====
  'dns.title': { de: 'Werbung blockieren?', krd: 'ڕیکلام بلوک بکەم؟' },
  'dns.instruction': { de: 'Auf Android: Einstellungen → Private DNS →', krd: 'لە ئەندرۆید: ڕێکخستنەکان → Private DNS →' },
  'dns.button': { de: 'Anleitung', krd: 'ڕێنمایی' },

  // ===== Settings Page =====
  'settings.title': { de: '🔇 Werbung blockieren', krd: '🔇 بلوکی ڕیکلام' },
  'settings.desc': { de: 'Mit AdGuard DNS wird Werbung auf deinem ganzen Gerät blockiert – auch in den Videoplayern. Keine App-Installation nötig.', krd: 'بە AdGuard DNS ڕیکلام لە هەموو ئامێرەکەتدا دەبڵۆکێت – تەنانەت لە پلەیەرەکانیشدا. پێویستی بە دامەزراندنی ئەپ نییە.' },
  'settings.choose': { de: 'Wähle dein Gerät:', krd: 'ئامێرەکەت هەڵبژێرە:' },
  'settings.android': { de: '📱 Android', krd: '📱 ئەندرۆید' },
  'settings.iphone': { de: '📱 iPhone/iPad', krd: '📱 ئایفۆن/ئایپاد' },
  'settings.done': { de: '✅ Fertig – Werbefrei!', krd: '✅ تەواو – بێ ڕیکلام!' },
  'settings.doneDesc': { de: 'Jetzt werden auf deinem ganzen Gerät keine Werbung mehr angezeigt – auch nicht in den Video-Playern. Die Filme und Serien laufen normal weiter!', krd: 'ئێستا لە هەموو ئامێرەکەتدا هیچ ڕیکلامێک نیشان نادرێت – تەنانەت لە پلەیەرەکانیشدا. فیلم و زنجیرەکان بە ئاسایی بەردەوام دەبن!' },
  'settings.tip': { de: '💡 Einmal eingerichtet – dauerhaft werbefrei. Funktioniert auf Android, iPhone, Windows und Mac.', krd: '💡 جارێک ڕێکبخە – بەردەوام بێ ڕیکلام. لە ئەندرۆید، ئایفۆن، ویندۆز و ماکدا کاردەکات.' },

  // ===== Genres =====
  'genre.action': { de: 'Action', krd: 'ئەکشن' },
  'genre.adventure': { de: 'Abenteuer', krd: 'سەرکێشی' },
  'genre.animation': { de: 'Animation', krd: 'ئەنیمەیشن' },
  'genre.comedy': { de: 'Komödie', krd: 'کۆمیدیا' },
  'genre.crime': { de: 'Krimi', krd: 'تەحماوی' },
  'genre.documentary': { de: 'Dokumentation', krd: 'بەڵگەنامەیی' },
  'genre.drama': { de: 'Drama', krd: 'دراما' },
  'genre.family': { de: 'Familie', krd: 'خێزان' },
  'genre.fantasy': { de: 'Fantasy', krd: 'خەیاڵی' },
  'genre.history': { de: 'Historisch', krd: 'مێژوو' },
  'genre.horror': { de: 'Horror', krd: 'تۆقێنەر' },
  'genre.music': { de: 'Musik', krd: 'میوزیک' },
  'genre.mystery': { de: 'Mystery', krd: 'نهێنی' },
  'genre.romance': { de: 'Romanze', krd: 'ڕۆمانس' },
  'genre.sciencefiction': { de: 'Sci-Fi', krd: 'خەیاڵی زانستی' },
  'genre.thriller': { de: 'Thriller', krd: 'هەستبزوێن' },
  'genre.war': { de: 'Krieg', krd: 'جەنگ' },
  'genre.western': { de: 'Western', krd: 'ڕۆژئاوا' },

  // ===== Footer =====
  'footer.brand': { de: 'Fuad Mustafa', krd: 'فوئاد مستەفا' },
  'footer.powered': { de: 'Powered by Fuad Mustafa', krd: 'پێشکەشکراو لەلایەن فوئاد مستەفا' },
  'footer.copyright': { de: '© 2024 Fuad Mustafa. All rights reserved.', krd: '© 2024 فوئاد مستەفا. هەموو مافێک پارێزراوە.' },

  // ===== Badini API Settings =====
  'badini.title': { de: '🌐 Badini Übersetzung', krd: '🌐 وەرگێڕانی بادینی' },
  'badini.desc': { de: 'Trage deinen Badini API-Key ein, um Filmtitel und Beschreibungen automatisch ins Kurdische (Badini) zu übersetzen.', krd: 'کلیلی Badini API-کەی خۆت بنووسە بۆ وەرگێڕانی ناوی فیلم و زنجیرەکان بۆ کوردی (بادینی).' },
  'badini.placeholder': { de: 'Badini API-Key eingeben...', krd: 'کلیلی Badini API-کەی بنووسە...' },
  'badini.save': { de: '💾 Speichern', krd: '💾 پاشەکەوت بکە' },
  'badini.saved': { de: '✅ API-Key gespeichert!', krd: '✅ کلیلی API پاشەکەوت کرا!' },
  'badini.hint': { de: 'Key bekommst du auf deiner Badini-Translate-Seite:', krd: 'کلیلەکەت لە پەڕەی Badini-Translate-ی خۆت وەردەگریت:' },
};

export function t(key: string, lang: Language): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return translations[key]?.de || key;
}

export function getAllKeys(): string[] {
  return Object.keys(translations);
}

export const LANGUAGES = [
  { code: 'de' as Language, label: 'Deutsch', flag: '🇩🇪' },
  { code: 'krd' as Language, label: 'Badini', flag: '🏳️' },
];

export function getLanguageLabel(code: Language): string {
  return LANGUAGES.find(l => l.code === code)?.label || code;
}
