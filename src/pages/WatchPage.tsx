import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getMovieDetails, getTVShowDetails, getImageUrl } from '../api/tmdb';
import { EMBED_SOURCES, PLAYER_TIMEOUT, type EmbedSource } from '../utils/embedServers';

interface WatchPageProps {
  item: any;
  onBack: () => void;
}

type PlayerState = 'loading' | 'ready' | 'error' | 'adblocked';

const WatchPage: React.FC<WatchPageProps> = ({ item, onBack }) => {
  const [details, setDetails] = useState<any>(null);
  const [serverIdx, setServerIdx] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [availableSources, setAvailableSources] = useState<EmbedSource[]>(EMBED_SOURCES);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const id = item.id;
  const isTV = !!(item.media_type === 'tv' || item.first_air_date || item.name);
  const mediaType = isTV ? 'tv' : 'movie';
  const title = item.title || item.name || '';

  // Details von TMDB laden
  useEffect(() => {
    (isTV ? getTVShowDetails(id) : getMovieDetails(id))
      .then(data => setDetails(data))
      .catch(() => {});
  }, [id, isTV]);

  // Auto-Server-Test: Alle Server parallel pingen, nur lebendige behalten
  useEffect(() => {
    let mounted = true;
    (async () => {
      const results = await Promise.all(
        EMBED_SOURCES.map(async (src) => {
          try {
            const ac = new AbortController();
            const t = setTimeout(() => ac.abort(), 3000);
            await fetch(src.testUrl || src.url(1, 'movie'), {
              mode: 'no-cors',
              signal: ac.signal,
            });
            clearTimeout(t);
            return { src, alive: true };
          } catch {
            return { src, alive: false };
          }
        })
      );
      if (!mounted) return;
      const alive = results.filter(r => r.alive).map(r => r.src);
      if (alive.length > 0) setAvailableSources(alive);
    })();
    return () => { mounted = false; };
  }, [item.id]);

  const currentSource = availableSources[serverIdx] || EMBED_SOURCES[serverIdx];

  // Nächsten Server probieren (bei Timeout oder Fehler)
  const tryNextServer = useCallback(() => {
    if (serverIdx < availableSources.length - 1) {
      setServerIdx(prev => prev + 1);
      setPlayerState('loading');
    } else {
      setPlayerState('adblocked');
    }
  }, [serverIdx, availableSources.length]);

  // Timeout: Wenn Player nicht innerhalb von 15s lädt, nächstes Server
  useEffect(() => {
    if (playerState !== 'loading') return;
    timerRef.current = window.setTimeout(tryNextServer, PLAYER_TIMEOUT);
    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [playerState, tryNextServer, serverIdx]);

  // Manueller Server-Wechsel
  const switchServer = useCallback((idx: number) => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    setServerIdx(idx);
    setPlayerState('loading');
  }, []);

  // Komplett-Neustart
  const handleRetry = useCallback(() => {
    setServerIdx(0);
    setPlayerState('loading');
  }, []);

  // Iframe erfolgreich geladen
  const handleIframeLoad = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    setPlayerState('ready');
  }, []);

  const iframeUrl = currentSource?.url(id, mediaType) || '';
  const backdrop = details?.backdrop_path || item.backdrop_path;

  return (
    <div className="watch-page">
      <div
        className="watch-hero"
        style={backdrop ? {
          backgroundImage: `url(${getImageUrl(backdrop, 'original')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        <div className="watch-hero-overlay" />
        <button className="watch-back" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
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
              {details.runtime > 0 && (
                <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}min</span>
              )}
              {details.number_of_seasons > 0 && (
                <span>{details.number_of_seasons} Staffeln</span>
              )}
              {details.vote_average > 0 && (
                <span className="watch-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5c518" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {Math.round(details.vote_average * 10) / 10}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="watch-player-section">
        {/* Server-Auswahl mit Status */}
        <div className="server-select">
          <span className="server-label">Server:</span>
          {EMBED_SOURCES.map((s, i) => {
            const isAvail = availableSources.includes(s);
            const isCur = i === serverIdx;
            return (
              <button
                key={i}
                className={`server-btn${isCur ? ' active' : ''}${!isAvail ? ' offline' : ''}`}
                onClick={() => isAvail && switchServer(i)}
                title={isAvail ? s.name : `${s.name} (offline)`}
                disabled={!isAvail}
              >
                {s.name}
                {!isAvail && <span className="server-offline">⛔</span>}
                {isCur && playerState === 'ready' && <span className="server-check">✅</span>}
              </button>
            );
          })}
        </div>

        {/* Player-Container */}
        <div className="player-container">
          {playerState === 'loading' && (
            <div className="player-loading">
              <div className="loader-ring" />
              <span>Verbinde mit {currentSource?.name}...</span>
              <span className="player-hint">Server-Test aktiv, Werbeblocker läuft</span>
            </div>
          )}

          {playerState === 'adblocked' && (
            <div className="player-loading">
              <div className="player-error-icon">🚫</div>
              <span>Alle Server blockiert?</span>
              <div className="player-hint" style={{ marginTop: 16, textAlign: 'left', lineHeight: 1.6 }}>
                <strong>Mögliche Lösungen:</strong><br />
                1. AdGuard DNS im WLAN aktivieren (Einstellungen → 🔇)<br />
                2. uBlock Origin im Browser nutzen<br />
                3. VPN deaktivieren falls aktiv<br />
                4. Später erneut versuchen
              </div>
              <button className="hero-btn hero-btn-primary" onClick={handleRetry} style={{ marginTop: 20 }}>
                🔄 Erneut versuchen
              </button>
            </div>
          )}

          <iframe
            ref={iframeRef}
            key={`${serverIdx}-${item.id}`}
            src={iframeUrl}
            className={`player-iframe${playerState === 'ready' ? ' ready' : ''}`}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            title={title}
            onLoad={handleIframeLoad}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        {/* Statuszeile */}
        <div className="server-status">
          <span className={`status-dot ${playerState === 'ready' ? 'online' : 'loading'}`} />
          {playerState === 'ready' && `Verbunden mit ${currentSource?.name} – Werbeblocker aktiv`}
          {playerState === 'loading' && `Teste ${currentSource?.name}...`}
          {playerState === 'adblocked' && 'Kein Server verfügbar – DNS-Werbeblocker prüfen'}
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
