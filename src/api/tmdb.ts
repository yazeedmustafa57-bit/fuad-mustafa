const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '';
  return `${IMG_BASE}/${size}${path}`;
};

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API Key nicht gefunden. Bitte .env Datei mit VITE_TMDB_API_KEY erstellen.');
  }
  const query = new URLSearchParams({ api_key: TMDB_API_KEY, language: 'de-DE', ...params });
  const res = await fetch(`${TMDB_BASE}${endpoint}?${query}`);
  if (!res.ok) throw new Error(`TMDB Fehler: ${res.status}`);
  return res.json();
}

export const getTrending = (page = 1) =>
  fetchTMDB('/trending/all/week', { page: String(page) });

export const getPopularMovies = (page = 1) =>
  fetchTMDB('/movie/popular', { page: String(page), region: 'DE' });

export const getPopularTVShows = (page = 1) =>
  fetchTMDB('/tv/popular', { page: String(page) });

export const searchMulti = (query: string, page = 1) =>
  fetchTMDB('/search/multi', { query, page: String(page) });

export const getMovieDetails = (id: number) =>
  fetchTMDB(`/movie/${id}`, { append_to_response: 'videos' });

export const getTVShowDetails = (id: number) =>
  fetchTMDB(`/tv/${id}`, { append_to_response: 'videos' });

export const getGenres = (type: 'movie' | 'tv') =>
  fetchTMDB(`/genre/${type}/list`);

export const discoverByGenre = (type: 'movie' | 'tv', genreId: number, page = 1) =>
  fetchTMDB(`/discover/${type}`, {
    with_genres: String(genreId),
    page: String(page),
    sort_by: 'popularity.desc',
  });
