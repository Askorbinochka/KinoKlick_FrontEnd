"use client";

import { useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard";

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  genres: string[];
  duration: number;
  rating: number;
  trailerUrl?: string;
  director?: string;
  language?: string;
  ageRestriction?: number;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 2. Робимо запит до сервера на Render
    fetch("https://kinoklick-backend.onrender.com/movies")
      .then((res) => res.json())
      .then((data: Movie[]) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження фільмів:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-white">
        <p className="text-xl">Завантаження фільмів з сервера...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Зараз у кіно</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </main>
  );
}