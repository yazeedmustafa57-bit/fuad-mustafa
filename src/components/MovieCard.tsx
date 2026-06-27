import React from 'react';
import { getImageUrl } from '../api/tmdb';
import { useLang } from '../App';
import { t } from '../i18n';

interface MovieCardProps {
  item: any;
  onClick: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ item, onClick }) => {
  const { lang } = useLang();
  const title = (lang === 'krd' && item._translatedTitle)
    ? item._translatedTitle
    : (item.title || item.name || 'Unknown');
  const date = item.release_date || item.first_air_date || '';
  const year = date ? new Date(date).getFullYear() : '';
  const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0;
  const mediaType = item.media_type === 'tv' ? t('media.series', lang) : t('media.movie', lang);

  return (
    <div className="movie-card" onClick={onClick}>
      <div className="movie-card-poster">
        {item.poster_path ? (
          <img src={getImageUrl(item.poster_path, 'w342')} alt={title} loading="lazy" />
        ) : (
          <div className="no-poster">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2.18"/>
              <path d="M8 8h.01M4 16l4-4 3 3 3-4 6 5"/>
            </svg>
            <span>{title}</span>
          </div>
        )}
        <div className="movie-card-overlay">
          {rating > 0 && (
            <div className="movie-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {rating}
            </div>
          )}
          <span className="movie-type">{mediaType}</span>
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{title}</h3>
        {year && <span className="movie-card-year">{year}</span>}
      </div>
    </div>
  );
};

export default MovieCard;
