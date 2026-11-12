"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import DateFilter from "@/components/DateFilter";
import MovieCard from "@/components/MovieCard";
import { API_URL } from "@/app/api";

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  genres: string[];
  duration: number;
  rating: number;
  ageRating?: string;
  ageRestriction?: number | string;
  releaseDate?: string;
  country?: string;
  director?: string;
}

type Session = {
  id: string;
  movieId?: string;
  movie?: { id?: string };
  startTime: string;
  price?: number;
  basePrice?: number;
  ticketPrice?: number;
  pricePerSeat?: number;
};

function asList<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

function getDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/movies`),
      fetch(`${API_URL}/sessions`),
    ])
      .then(async ([moviesRes, sessionsRes]) => {
        if (!moviesRes.ok || !sessionsRes.ok) throw new Error("Не вдалося завантажити фільми та розклад.");
        const [moviesData, sessionsData] = await Promise.all([moviesRes.json(), sessionsRes.json()]);
        setMovies(asList<Movie>(moviesData, ["movies", "items", "data"]));
        setSessions(asList<Session>(sessionsData, ["sessions", "items", "data"]));
      })
      .catch((err) => {
        console.error("Помилка завантаження каталогу:", err);
        setError(err instanceof Error ? err.message : "Не вдалося завантажити каталог.");
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredMovie = movies[0];
  const sessionsForMovie = (movie: Movie) => sessions.filter((session) =>
    session.movieId === movie.id || session.movie?.id === movie.id
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[1320px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        {featuredMovie && <HeroBanner movie={featuredMovie} />}

        <DateFilter selectedDate={selectedDate} onSelect={setSelectedDate} />

        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h1 className="text-lg font-bold">Зараз у кіно</h1>
          <span className="text-xs text-red-400">{movies.length} фільми</span>
        </div>
        
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Завантажуємо фільми та розклад…</div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        ) : movies.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">Фільмів поки немає.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} sessions={sessionsForMovie(movie)} selectedDate={selectedDate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
