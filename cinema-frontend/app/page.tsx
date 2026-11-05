"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  genres: string[];
  duration: number;
  rating: number;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Твоя класна шапка */}
      <Navbar />

      <main className="container mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Зараз у кіно</h1>
        
        {loading ? (
          <div className="text-center py-20 text-gray-400">Завантаження фільмів з сервера...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}