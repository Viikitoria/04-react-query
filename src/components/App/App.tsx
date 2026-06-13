import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";

import css from "./App.module.css";

interface MoviesResponse {
  results: Movie[];
  total_pages: number;
}

const Paginate = (ReactPaginate as any).default || ReactPaginate;

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError, isSuccess, isFetching } =
    useQuery<MoviesResponse>({
      queryKey: ["movies", query, page],
      queryFn: () => fetchMovies(query, page),
      enabled: query.trim().length > 0,
      placeholderData: keepPreviousData,
    });

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  // ✅ toast when SUCCESS but empty results
  useEffect(() => {
    if (isSuccess && query && movies.length === 0) {
      toast.error(`No movies found for "${query}"`);
    }
  }, [isSuccess, movies.length, query]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const isEmpty = isSuccess && movies.length === 0;

  return (
    <div>
      <SearchBar onSubmit={handleSearch} />

      {isLoading && <Loader />}

      {isError && <ErrorMessage />}

      {/* optional empty state */}
      {isEmpty && <p>No results found</p>}

      {!isLoading && !isError && movies.length > 0 && (
        <MovieGrid movies={movies} onSelect={setSelectedMovie} />
      )}

      {isFetching && !isLoading && <Loader />}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {totalPages > 1 && (
        <Paginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }: { selected: number }) =>
            setPage(selected + 1)
          }
          forcePage={Math.max(page - 1, 0)}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
          breakLabel="..."
        />
      )}
    </div>
  );
}