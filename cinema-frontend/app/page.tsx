"use client";

import { useState, useEffect, useCallback } from "react";
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

type DateOption = { key: string; day: string; label: string };

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

function getDateOptions(timestamp: number): DateOption[] {
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(timestamp + index * 24 * 60 * 60 * 1000);
    return {
      key: getDateKey(date),
      day: date.toLocaleDateString("uk-UA", { day: "2-digit", timeZone: "Europe/Kyiv" }),
      label: index === 0
        ? "Сьогодні"
        : index === 1
          ? "Завтра"
          : date.toLocaleDateString("uk-UA", { weekday: "short", timeZone: "Europe/Kyiv" }),
    };
  });
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [referenceTime, setReferenceTime] = useState(0);
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [moviesRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/movies`),
        fetch(`${API_URL}/sessions`),
      ]);
      if (!moviesRes.ok || !sessionsRes.ok) throw new Error("Не вдалося завантажити афішу.");
      const [moviesData, sessionsData] = await Promise.all([moviesRes.json(), sessionsRes.json()]);
      const fetchedAt = Date.now();
      const dates = getDateOptions(fetchedAt);
      setMovies(asList<Movie>(moviesData, ["movies", "items", "data"]));
      setSessions(asList<Session>(sessionsData, ["sessions", "items", "data"]));
      setReferenceTime(fetchedAt);
      setDateOptions(dates);
      setSelectedDate((current) => current || dates[0].key);
    } catch (err) {
      console.error("Помилка завантаження каталогу:", err);
      setError(err instanceof Error ? err.message : "Не вдалося завантажити афішу.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  const featuredMovie = movies[0];
  const selectedDateLabel = dateOptions.find((date) => date.key === selectedDate)?.key;
  const selectedDateTitle = selectedDateLabel
    ? new Date(`${selectedDateLabel}T12:00:00`).toLocaleDateString("uk-UA", { day: "numeric", month: "long", timeZone: "Europe/Kyiv" })
    : "";
  const sessionsForMovie = (movie: Movie) => sessions.filter((session) =>
    session.movieId === movie.id || session.movie?.id === movie.id
  );
  const hasFutureSessions = sessions.some((session) => new Date(session.startTime).getTime() >= referenceTime);

  return (
    <div className="min-h-screen bg-[#0d1016] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        {featuredMovie && <HeroBanner movie={featuredMovie} />}

        <DateFilter dates={dateOptions} selectedDate={selectedDate} onSelect={setSelectedDate} />

        {!loading && !error && movies.length > 0 && !hasFutureSessions && (
          <section role="status" className="rounded-xl border border-white/[0.07] bg-[#121720] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Найближчих сеансів поки немає</h2>
            <p className="mt-1 text-xs text-slate-400">Афіша завантажена, але в розкладі немає майбутніх показів. Спробуйте пізніше.</p>
          </section>
        )}

        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
          <h1 className="text-lg font-bold">Афіша{selectedDateTitle ? ` · ${selectedDateTitle}` : ""}</h1>
          <span className="text-xs text-slate-500">{movies.length} фільмів</span>
        </div>
        
        {loading ? (
          <div aria-label="Завантаження афіші" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {[0, 1, 2, 3].map((item) => <div key={item} className="overflow-hidden rounded-xl border border-white/[0.05] bg-[#121720] p-3"><div className="aspect-[2/3] animate-pulse rounded-lg bg-[#1b2230]" /><div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-[#1b2230]" /><div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#1b2230]" /></div>)}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-white/[0.07] bg-[#121720] p-8">
            <h2 className="text-lg font-bold">Не вдалося завантажити афішу</h2>
            <p className="mt-2 text-sm text-slate-400">Перевірте з’єднання та спробуйте ще раз. {error}</p>
            <button type="button" onClick={() => void loadCatalog()} className="mt-5 rounded-lg bg-[#e3262d] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#f13a41]">Спробувати знову</button>
          </div>
        ) : movies.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">Фільмів поки немає.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} sessions={sessionsForMovie(movie)} selectedDate={selectedDate} referenceTime={referenceTime} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
