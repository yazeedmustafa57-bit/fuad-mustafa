import React, { useState, useEffect, useCallback } from 'react';
import { getTrending, getPopularMovies, getPopularTVShows, searchMulti } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import { useLang } from '../App';
import { t } from '../i18n';
import { translateTitle } from '../services/translate';

interface ContentGridProps {
  type: 'trending' | 'movies' | 'series' | 'search';
  searchQuery?: string;
  onSelect: (item: any) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ type, searchQuery, onSelect }) => {
  const { lang } = useLang();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [translatedIds, setTranslatedIds] = useState<Record<number, string>>({});

  // Übersetze Titel wenn Sprache = KRD
  useEffect(() => {
    if (lang === 'krd' && items.length > 0) {
      const toTranslate = items.filter(item => !translatedIds[item.id]);
      if (toTranslate.length === 0) return;
      
      toTranslate.forEach(item => {
        const origTitle = item.title || item.name || '';
        if (origTitle && !translatedIds[item.id]) {
          translateTitle(origTitle).then(t => {
            if (t !== origTitle) {
              setTranslatedIds(prev => ({ ...prev, [item.id]: t }));
            }
          });
        }
      });
    }
  }, [lang, items.length, translatedIds]);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      let data: any;
      if (type === 'search' && searchQuery) {
        data = await searchMulti(searchQuery, p);
      } else {
        switch (type) {
          case 'movies': data = await getPopularMovies(p); break;
          case 'series': data = await getPopularTVShows(p); break;
          default: data = await getTrending(p);
        }
      }
      setItems(p === 1 ? data.results : prev => [...prev, ...data.results]);
      setTotalPages(Math.min(data.total_pages, 500));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, searchQuery]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setTranslatedIds({});
    fetchData(1);
  }, [type, searchQuery, fetchData]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchData(next);
  };

  if (error) {
    return (
      <div className="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2>{lang === 'krd' ? 'هەڵە لە بارکردندا' : 'Fehler beim Laden'}</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => fetchData(1)}>
          {lang === 'krd' ? 'دووبارە هەوڵبدەرەوە' : 'Erneut versuchen'}
        </button>
      </div>
    );
  }

  const titles: Record<string, string> = {
    trending: t('section.trending', lang),
    movies: lang === 'krd' ? 'فیلمە بەناوبانگەکان' : 'Beliebte Filme',
    series: lang === 'krd' ? 'زنجیرە بەناوبانگەکان' : 'Beliebte Serien',
    search: searchQuery ? `${lang === 'krd' ? 'گەڕان' : 'Suche'}: "${searchQuery}"` : '',
  };

  return (
    <div className="content-page">
      <div className="content-header">
        <h1 className="page-title">{titles[type] || type}</h1>
      </div>
      {loading && items.length === 0 ? (
        <div className="loading-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-poster"/>
              <div className="skeleton-text"/>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="movie-grid">
            {items.map((item: any, i: number) => (
              <MovieCard
                key={`${item.id}-${i}`}
                item={{ ...item, _translatedTitle: translatedIds[item.id] || '' }}
                onClick={() => onSelect(item)}
              />
            ))}
          </div>
          {page < totalPages && (
            <div className="load-more">
              <button className="btn-primary" onClick={loadMore} disabled={loading}>
                {loading ? (lang === 'krd' ? 'بار دەبێت...' : 'Lädt...') : t('section.loadMore', lang)}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContentGrid;
