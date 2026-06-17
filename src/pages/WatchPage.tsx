import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getMovieDetails, getTVShowDetails, getImageUrl } from '../api/tmdb';

interface WatchPageProps {
  item: any;
  onBack: () => void;
}

const EMBED_SOURCES = [
  { name: 'Server 1', url: (id: number, type: string) => `https://vidsrc.to/embed/${type}/${id}` },
  { name: 'Server 2', url: (id: number, type: string) => `https://www.2embed.skin/embed/${type}/${id}` },
  { name: 'Server 3', url: (id: number, type: string) => `https://www.2embed.cc/embed/${type}/${id}` },
];

const WatchPage: React.FC<WatchPageProps> = ({ item, onBack }) => {
  const [details, setDetails] = useState<any>(null);
  const [_loading, setLoading] = useState(true);
  const [serverIndex, setServerIndex] = useState(0);
  const [playerActive, setPlayerActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const id = item.id;
  const isTV = item.media_type === 'tv' || item.first_air_date || item.name;
  const mediaType = isTV ? 'tv' : 'movie';
  const title = item.title || item.name || '';

  useEffect(() => {
    setLoading(true);
    (isTV ? getTVShowDetails(id) : getMovieDetails(id))
      .then(data => { setDetails(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleActivatePlayer = useCallback(() => {
    setPlayerActive(true);
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 100);
  }, []);

  const handleServerChange = useCallback((index: number) => {
    setServerIndex(index);
    setPlayerActive(false);
  }, []);

  const embedUrl = EMBED_SOURCES[serverIndex].url(id, mediaType);
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
            </div>
          )}
        </div>
      </div>

      <div className="watch-player-section">
        <div className="server-select">
          <span className="server-label">Server:</span>
          {EMBED_SOURCES.map((s, i) => (
            <button
              key={i}
              className={`server-btn ${i === serverIndex ? 'active' : ''}`}
              onClick={() => handleServerChange(i)}
            >
              {s.name}
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
                <div className="player-overlay-hint">Keine Werbung – Player sicher aktivieren</div>
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
