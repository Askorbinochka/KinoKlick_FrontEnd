"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { API_URL } from "@/app/api";

type Session = {
  id: string;
  startTime: string;
  movieId?: string;
  movie?: { id?: string };
  price?: number;
  basePrice?: number;
  ticketPrice?: number;
  pricePerSeat?: number;
  hall?: { name?: string };
};

type Movie = {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string;
  trailerUrl?: string;
  genres?: string[] | string;
  genre?: string;
  ageRating?: string;
  ageLimit?: string;
  ageRestriction?: number;
  year?: number;
  releaseYear?: number;
  releaseDate?: string;
  country?: string;
  director?: string;
  language?: string;
  production?: string;
  format?: string;
  duration?: number;
  rating?: number;
};

function asSessions(data: unknown): Session[] {
  if (Array.isArray(data)) return data as Session[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["sessions", "items", "data"]) {
      if (Array.isArray(record[key])) return record[key] as Session[];
    }
  }
  return [];
}

function dateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("uk-UA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Kyiv",
  });
}

function formatFullDate(value: string) {
  return new Date(value).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Kyiv",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  });
}

function MovieDetailsContent() {
  const params = useParams<{ id: string }>();
  const movieId = params.id;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!movieId) return;

    Promise.all([
      fetch(`${API_URL}/movies/${movieId}`),
      fetch(`${API_URL}/sessions?movieId=${encodeURIComponent(movieId)}`),
    ])
      .then(async ([movieRes, sessionsRes]) => {
        if (!movieRes.ok) throw new Error("Не вдалося завантажити інформацію про фільм.");
        if (!sessionsRes.ok) throw new Error("Не вдалося завантажити розклад сеансів.");
        const [movieData, sessionsData] = await Promise.all([movieRes.json() as Promise<Movie>, sessionsRes.json()]);
        setMovie(movieData);
        const relatedSessions = asSessions(sessionsData)
          .filter((session) =>
            (session.movieId === movieId || session.movie?.id === movieId) &&
            new Date(session.startTime).getTime() >= Date.now()
          );
        setSessions(relatedSessions);
        if (relatedSessions.length) {
          const first = relatedSessions[0];
          setSelectedSessionId(first.id);
          setSelectedDate(dateKey(first.startTime));
        }
      })
      .catch((err) => {
        console.error("Помилка завантаження фільму та розкладу:", err);
        setError(err instanceof Error ? err.message : "Не вдалося завантажити сторінку фільму.");
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  const availableDates = useMemo(() => {
    const uniqueDates = [...new Set(sessions.map((session) => dateKey(session.startTime)))];
    return uniqueDates.sort();
  }, [sessions]);

  const availableSessions = sessions
    .filter((session) => dateKey(session.startTime) === selectedDate)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (loading) {
    return <div className="min-h-screen bg-[#0d1016] text-white"><Navbar /><p className="py-20 text-center text-slate-400">Завантажуємо сторінку фільму…</p></div>;
  }

  if (!movie) {
    return <div className="min-h-screen bg-[#0d1016] text-white"><Navbar /><p role="alert" className="py-20 text-center text-red-300">{error || "Фільм не знайдено."}</p></div>;
  }

  const genres = Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres || movie.genre || "—";
  const metadata = [
    { label: "Вікове обмеження", value: movie.ageRating || movie.ageLimit || movie.ageRestriction },
    { label: "Рік", value: movie.year || movie.releaseYear || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null) },
    { label: "Країна", value: movie.country },
    { label: "Режисер", value: movie.director },
    { label: "Мова", value: movie.language },
    { label: "Жанр", value: genres },
    { label: "Тривалість", value: movie.duration ? `${movie.duration} хв` : null },
    { label: "Виробництво", value: movie.production || movie.country },
    { label: "Формат", value: movie.format },
  ].filter((item) => item.value != null && item.value !== "");

  return (
    <div className="min-h-screen bg-[#0d1016] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-[1160px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Навігаційний ланцюжок">
          <Link href="/" className="hover:text-white">Фільми</Link><span>/</span><span className="text-slate-200">{movie.title}</span>
        </nav>

        <section className="grid gap-6 md:grid-cols-[260px_1fr] lg:gap-8">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <Image
              src={movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600"}
              alt={`Постер фільму «${movie.title}»`}
              fill
              sizes="(max-width: 768px) 100vw, 260px"
              className="object-cover"
            />
            {movie.trailerUrl && (
              <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="block border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-300 hover:text-white">
                ▶ Дивитись трейлер
              </a>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex flex-wrap gap-2 text-[10px]">
                {movie.ageRating && <span className="rounded bg-slate-800 px-2 py-1 text-slate-200">{movie.ageRating}</span>}
                <span className="rounded bg-slate-800 px-2 py-1 text-slate-300">{genres}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{movie.title}</h1>
            </div>

            <dl className="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3 border-y border-slate-800 py-4 text-xs sm:grid-cols-3">
              {metadata.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="mt-1 font-medium text-slate-200">{value}</dd>
                </div>
              ))}
              {movie.rating != null && <div><dt className="text-slate-500">Рейтинг</dt><dd className="mt-1 font-medium text-amber-400">★ {movie.rating}</dd></div>}
            </dl>

            <div className="max-w-3xl space-y-2">
              <h2 className="text-sm font-semibold">Про фільм</h2>
              <p className="text-xs leading-6 text-slate-400 sm:text-sm">{movie.description || "Опис фільму поки не додано."}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.07] bg-[#121720] p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold">Оберіть сеанс</h2>
              <p className="mt-1 text-xs text-slate-500">Доступні дата та час показу</p>
            </div>

            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            {availableDates.length ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        const first = sessions.find((session) => dateKey(session.startTime) === date);
                        if (first) setSelectedSessionId(first.id);
                      }}
                      aria-pressed={selectedDate === date}
                      className={`rounded-lg border px-3 py-2 text-xs uppercase transition ${selectedDate === date ? "border-red-500 bg-red-600 text-white" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"}`}
                    >
                      {formatDate(sessions.find((session) => dateKey(session.startTime) === date)!.startTime)}
                    </button>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-xs text-slate-500">Час сеансу</p>
                  <div className="flex flex-wrap gap-2">
                    {availableSessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setSelectedSessionId(session.id)}
                        aria-pressed={selectedSessionId === session.id}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-xs transition ${selectedSessionId === session.id ? "border-red-500 bg-red-500/10 text-white" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"}`}
                      >
                        <span className="font-bold">{formatTime(session.startTime)}</span>
                        <span className="border-l border-slate-700 pl-3 text-slate-400">{session.price ?? session.basePrice ?? session.ticketPrice ?? session.pricePerSeat ?? "—"} грн</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-white/[0.05] bg-[#0d1016] px-4 py-5">
                <p className="text-sm font-semibold text-slate-200">На цю дату сеансів немає</p>
                <p className="mt-1 text-xs text-slate-400">Оберіть іншу дату, щоб продовжити бронювання.</p>
                <Link href="/" className="mt-4 inline-flex rounded-lg bg-[#e3262d] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#f13a41]">До доступних сеансів</Link>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4">
              <Link
                href={selectedSessionId ? `/movies/${movieId}/seats?sessionId=${encodeURIComponent(selectedSessionId)}&date=${encodeURIComponent(formatFullDate(sessions.find((session) => session.id === selectedSessionId)?.startTime || ""))}&time=${encodeURIComponent(formatTime(sessions.find((session) => session.id === selectedSessionId)?.startTime || ""))}` : "#"}
                aria-disabled={!selectedSessionId}
                tabIndex={selectedSessionId ? 0 : -1}
                className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-bold transition md:ml-auto md:w-auto ${selectedSessionId ? "bg-red-600 text-white hover:bg-red-500" : "pointer-events-none bg-slate-800 text-slate-500"}`}
              >
                Забронювати
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function MovieDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1016] py-20 text-center text-slate-400">Завантаження…</div>}>
      <MovieDetailsContent />
    </Suspense>
  );
}
