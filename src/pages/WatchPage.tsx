import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getMovieDetails, getTVShowDetails, getImageUrl } from '../api/tmdb';

interface WatchPageProps {
  item: any;
  onBack: () => void;
}

type SubLang = 'off' | 'de' | 'en' | 'original';

/* Sprachcodes für Untertitel/Sprache */
const LANG_OPTIONS: { key: SubLang; label: string; flag: string }[] = [
  { key: 'off',   label: 'Keine UT',         flag: '🚫' },
  { key: 'de',    label: 'Deutsch',           flag: '🇩🇪' },
  { key: 'en',    label: 'Englisch',          flag: '🇬🇧' },
  { key: 'original', label: 'Original',       flag: '🎬' },
];

interface EmbedSource {
  name: string;
  url: (id: number, type: string, lang: SubLang) => string;
}

/* Haupt-Server mit Sprach-Parametern */
const EMBED_SOURCES: EmbedSource[] = [
  {
    name: 'Server 1',
    url: (id, type, lang) => {
      let base = `https://vidsrc.to/embed/${type}/${id}`;
      if (lang === 'de') base += '?sub=de';
      else if (lang === 'en') base += '?sub=en';
      return base;
    },
  },
  {
    name: 'Server 2',
    url: (id, type, lang) => {
      let base = `https://www.2embed.skin/embed/${type}/${id}`;
      if (lang === 'de') base += '?l=de';
      else if (lang === 'en') base += '?l=en';
      return base;
    },
  },
  {
    name: 'Server 3',
    url: (id, type, lang) => {
      let base = `https://www.2embed.cc/embed/${type}/${id}`;
      if (lang === 'de') base += '?l=de';
      else if (lang === 'en') base += '?l=en';
      return base;
    },
  },
];

/* Fallback-Server */
const FALLBACK_SOURCES: EmbedSource[] = [
  {
    name: 'Fallback 1',
    url: (id, type, lang) => {
      let base = `https://vidsrc.cc/v2/embed/${type}/${id}`;
      if (lang === 'de') base += '?lang=de';
      else if (lang === 'en') base += '?lang=en';
      return base;
    },
  },
  {
    name: 'Fallback 2',
    url: (id, type, lang) => {
      let base = `https://vidsrc.pro/embed/${type}/${id}`;
      if (lang === 'de') base += '?lang=de';
      else if (lang === 'en') base += '?lang=en';
      return base;
    },
  },
  {
    name: 'Fallback 3',
    url: (id, type, lang) => {
      let base = `https://embed.su/embed/${type}/${id}`;
      if (lang === 'de') base += '?lang=de';
      else if (lang === 'en') base += '?lang=en';
      return base;
    },
  },
];

const WatchPage: React.FC<WatchPageProps> = ({ item, onBack }) => {
  const [details, setDetails] = useState<any>(null);
  const [_loading, setLoading] = useState(true);
  const [serverIndex, setServerIndex] = useState(0);
  const [playerActive, setPlayerActive] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [subLang, setSubLang] = useState<SubLang>('de');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const id = item.id;
  const isTV = item.media_type === 'tv' || item.first_air_date || item.name;
  const mediaType = isTV ? 'tv' : 'movie';
  const title = item.title || item.name || '';

  const sources = showFallback ? FALLBACK_SOURCES : EMBED_SOURCES;

  useEffect(() => {
    setLoading(true);
    setPlayerActive(false);
    (isTV ? getTVShowDetails(id) : getMovieDetails(id))
      .then(data => { setDetails(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, isTV]);

  /* Originalsprache aus TMDB */
  const origLang = useMemo(() => {
    if (!details?.spoken_languages?.length) return '';
    return details.spoken_languages[0].iso_639_1 || '';
  }, [details]);

  const handleActivatePlayer = useCallback(() => {
    setPlayerActive(true);
    setTimeout(() => {
      iframeRef.current?.focus();
    }, 100);
  }, []);

  const handleServerChange = useCallback((index: number) => {
    setServerIndex(index);
    setPlayerActive(false);
  }, []);

  const toggleSources = useCallback(() => {
    setShowFallback(prev => !prev);
    setServerIndex(0);
    setPlayerActive(false);
  }, []);

  const handleLangChange = useCallback((lang: SubLang) => {
    setSubLang(lang);
    setPlayerActive(false);
  }, []);

  const embedUrl = useMemo(() => {
    /* Für 'original' setzen wir den Code der Originalsprache, falls bekannt */
    const activeLang = subLang === 'original' ? (origLang || 'en') : subLang;
    return sources[serverIndex].url(id, mediaType, activeLang as SubLang);
  }, [sources, serverIndex, id, mediaType, subLang, origLang]);

  const backdrop = details?.backdrop_path || item.backdrop_path;

  return (
    <div className="watch-page">
      <div className="watch-hero" style={backdrop ? {
        backgroundImage: `url(${getImageUrl(backdrop, 'original')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}>
        <div className="watch-hero-overlay" />
        <button className="watch-back" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Zurück
        </button>

        <div className="watch-info">
          <h1 className="watch-title">{title}</h1>
          {details && (
            <div className="watch-meta">
              {details.genres?.map((g: any) => (
                <span key={g.id} className="watch-genre">{g.name}</span>
              ))}
              {details.runtime && <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}min</span>}
              {details.number_of_seasons && <span>{details.number_of_seasons} Staffeln</span>}
              {details.vote_average > 0 && (
                <span className="watch-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5c518" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {Math.round(details.vote_average * 10) / 10}
                </span>
              )}
              {/* Verfügbare Sprachen anzeigen */}
              {details.spoken_languages?.length > 0 && (
                <span className="watch-languages" title="Verfügbare Sprachen">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  {details.spoken_languages.map((l: any) => l.english_name).join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="watch-player-section">
        <div className="server-select">
          <span className="server-label">Server:</span>
          {sources.slice(0, 3).map((s, i) => (
            <button
              key={i}
              className={`server-btn ${i === serverIndex ? 'active' : ''}`}
              onClick={() => handleServerChange(i)}
            >
              {s.name}
            </button>
          ))}
          <button
            className={`server-btn ${showFallback ? 'active' : ''}`}
            onClick={toggleSources}
            title="Alternative Server anzeigen"
          >
            {showFallback ? '← Haupt' : '↻ Mehr'}
          </button>
        </div>

        {/* Sprachauswahl für Untertitel / Audio */}
        <div className="lang-select">
          <span className="server-label">Sprache:</span>
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`lang-btn ${subLang === opt.key ? 'active' : ''}`}
              onClick={() => handleLangChange(opt.key)}
              title={opt.label}
            >
              {opt.flag} {opt.label}
            </button>
          ))}
        </div>

        <div className="player-container">
          {!playerActive ? (
            <div className="player-overlay" onClick={handleActivatePlayer}>
              <div className="player-overlay-content">
                <div className="player-overlay-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--accent-red)" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div className="player-overlay-text">Zum Abspielen tippen</div>
                <div className="player-overlay-hint">
                  {subLang === 'de' ? '🇩🇪 Deutsche Untertitel aktiv' : 
                   subLang === 'en' ? '🇬🇧 Englische Untertitel aktiv' : 
                   subLang === 'original' ? '🎬 Originalsprache' : 'Keine Untertitel'}
                </div>
              </div>
            </div>
          ) : null}
          {playerActive ? (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="player-iframe ready"
              allowFullScreen
              allow="autoplay; fullscreen; clipboard-write"
              title={title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            />
          ) : null}
          {!playerActive ? (
            <div className="player-loading">
              <div className="loader-ring"/>
              <span>Player wird geladen...</span>
            </div>
          ) : null}
        </div>

        {details?.overview && (
          <div className="watch-overview">
            <h3>Über {title}</h3>
            <p>{details.overview}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
