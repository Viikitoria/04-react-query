import axios from "axios";
import type { Movie } from "../types/movie";

export interface MoviesResponse {
  results: Movie[];
  total_pages: number;
}

export const fetchMovies = async (
  query: string,
  page: number,
): Promise<MoviesResponse> => {
  if (!query.trim()) {
    return { results: [], total_pages: 0 };
  }

  try {
    const { data } = await axios.get<MoviesResponse>(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          query,
          page,
          language: "en-US",
          include_adult: false,
        },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN_2}`,
        },
      },
    );

    return {
      results: data?.results ?? [],
      total_pages: typeof data?.total_pages === "number" ? data.total_pages : 0,
    };
  } catch {
    return { results: [], total_pages: 0 };
  }
};