export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  media_type: string;
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
  media_type: string;
}

export interface TMDBResponse {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  tagline: string;
  status: string;
  seasons: Season[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
}

export interface Video {
  key: string;
  site: string;
  type: string;
  name: string;
}
