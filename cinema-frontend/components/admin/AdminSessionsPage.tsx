"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/app/api";

type Movie = {
  id?: string | number;
  _id?: string | number;
  title?: string;
  duration?: number;
  genres?: string[] | string;
};

type ApiSession = {
  id?: string | number;
  _id?: string | number;
  movieId?: string | number;
  movie?: Movie;
  hallId?: string | number;
  hall?: { id?: string | number; _id?: string | number; name?: string };
  hallName?: string;
  startTime?: string;
  price?: number;
  basePrice?: number;
  ticketPrice?: number;
  pricePerSeat?: number;
  status?: string;
};

type Session = {
  id: string;
  movieId: string;
  movieTitle: string;
  genres: string;
  duration: number;
  hallId: string;
  hallName: string;
  startTime: string;
  price: number | null;
  status?: string;
};

type Hall = { id: string; name: string };

const KYIV = "Europe/Kyiv";
const HOUR_HEIGHT = 64;
const FIRST_HOUR = 12;
const HOURS = Array.from({ length: 11 }, (_, index) => FIRST_HOUR + index);

function asList<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
}

function idOf(value?: string | number) {
  return value == null ? "" : String(value);
}

function dateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("uk-UA", { timeZone: KYIV, ...options }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: KYIV,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function timeInMinutes(value: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

function normalizedStatus(session: Session, now: number) {
  const status = session.status?.toLowerCase();
  if (status?.includes("cancel")) return "Скасовано";
  if (status?.includes("complete") || status?.includes("finished")) return "Завершено";
  return new Date(session.startTime).getTime() < now ? "Завершено" : "Заплановано";
}

function StatusBadge({ label }: { label: string }) {
  const colors = label === "Заплановано"
    ? "bg-emerald-500/10 text-emerald-300"
    : label === "Скасовано"
      ? "bg-red-500/10 text-red-300"
      : "bg-slate-700/60 text-slate-300";
  return <span className={`inline-flex min-w-[120px] rounded-md px-2.5 py-1.5 text-[11px] font-medium ${colors}`}>{label}</span>;
}

function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4.5" width="14" height="13" rx="2" /><path d="M6.5 2.5v4M13.5 2.5v4M3 8h14" /></svg>;
}

function ListIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 5h10M7 10h10M7 15h10" /><circle cx="3.5" cy="5" r=".7" fill="currentColor" /><circle cx="3.5" cy="10" r=".7" fill="currentColor" /><circle cx="3.5" cy="15" r=".7" fill="currentColor" /></svg>;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [dateFilter, setDateFilter] = useState("");
  const [movieFilter, setMovieFilter] = useState("");
  const [hallFilter, setHallFilter] = useState("");
  const [calendarDate, setCalendarDate] = useState(() => dateKey(new Date()));

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sessionsResponse, moviesResponse] = await Promise.all([
        fetch(`${API_URL}/sessions`),
        fetch(`${API_URL}/movies`),
      ]);
      if (!sessionsResponse.ok || !moviesResponse.ok) {
        throw new Error("Сервер не зміг завантажити розклад або афішу.");
      }
      const [sessionsPayload, moviesPayload] = await Promise.all([
        sessionsResponse.json(),
        moviesResponse.json(),
      ]);
      setSessions(asList<ApiSession>(sessionsPayload, ["sessions", "items", "data"]).flatMap((item, index) => {
        if (!item.startTime || Number.isNaN(new Date(item.startTime).getTime())) return [];
        const id = idOf(item.id ?? item._id) || `${item.startTime}-${index}`;
        const movieId = idOf(item.movieId ?? item.movie?.id ?? item.movie?._id);
        const hallId = idOf(item.hallId ?? item.hall?.id ?? item.hall?._id ?? item.hall?.name ?? item.hallName);
        const priceValue = item.price ?? item.basePrice ?? item.ticketPrice ?? item.pricePerSeat;
        const genres = item.movie?.genres;
        return [{
          id,
          movieId,
          movieTitle: item.movie?.title || "Фільм",
          genres: Array.isArray(genres) ? genres.join(" · ") : genres || "",
          duration: Number(item.movie?.duration) || 120,
          hallId,
          hallName: item.hall?.name || item.hallName || "Зал не вказано",
          startTime: item.startTime,
          price: priceValue == null || !Number.isFinite(Number(priceValue)) ? null : Number(priceValue),
          status: item.status,
        }];
      }));
      setMovies(asList<Movie>(moviesPayload, ["movies", "items", "data"]));
    } catch (loadError) {
      console.error("Помилка завантаження адмін-розкладу:", loadError);
      setError(loadError instanceof Error ? loadError.message : "Не вдалося завантажити розклад.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadSchedule(); }, [loadSchedule]);

  const movieNames = useMemo(() => {
    const names = new Map<string, string>();
    movies.forEach((movie) => {
      const id = idOf(movie.id ?? movie._id);
      if (id && movie.title) names.set(id, movie.title);
    });
    return names;
  }, [movies]);

  const enrichedSessions = useMemo(() => sessions.map((session) => ({
    ...session,
    movieTitle: movieNames.get(session.movieId) || session.movieTitle,
  })), [sessions, movieNames]);

  const halls = useMemo(() => {
    const unique = new Map<string, Hall>();
    enrichedSessions.forEach((session) => {
      if (session.hallId) unique.set(session.hallId, { id: session.hallId, name: session.hallName });
    });
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, "uk"));
  }, [enrichedSessions]);

  const dates = useMemo(() => [...new Set(enrichedSessions.map((session) => dateKey(session.startTime)))].sort(), [enrichedSessions]);
  const filteredSessions = useMemo(() => enrichedSessions.filter((session) =>
    (!dateFilter || dateKey(session.startTime) === dateFilter) &&
    (!movieFilter || session.movieId === movieFilter) &&
    (!hallFilter || session.hallId === hallFilter)
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()), [enrichedSessions, dateFilter, movieFilter, hallFilter]);

  const todayLabel = formatDate(new Date().toISOString(), { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const now = Date.now();
  const upcoming = filteredSessions.filter((session) => new Date(session.startTime).getTime() >= now);
  const past = filteredSessions.filter((session) => new Date(session.startTime).getTime() < now).reverse();
  const calendarSessions = filteredSessions.filter((session) => dateKey(session.startTime) === calendarDate);
  const calendarHalls = halls.filter((hall) => !hallFilter || hall.id === hallFilter);

  const resetFilters = () => {
    setDateFilter("");
    setMovieFilter("");
    setHallFilter("");
  };

  return (
    <div className="min-h-screen bg-[#0b0e13] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[216px] flex-col border-r border-white/[0.06] bg-[#111620] px-4 py-7 md:flex">
        <Link href="/" className="px-2 text-[25px] font-extrabold tracking-tight text-white">KinoKlick</Link>
        <span className="mt-1 px-2 text-[10px] font-semibold tracking-wide text-slate-500">АДМІН-ПАНЕЛЬ</span>
        <nav className="mt-11" aria-label="Адмін-навігація">
          <Link href="/admin/sessions" aria-current="page" className="flex h-12 items-center gap-3 rounded-lg border-l-[3px] border-[#e3262d] bg-[#2b1b22] px-3 text-sm font-semibold text-rose-200">
            <CalendarIcon /> Сеанси
          </Link>
        </nav>
        <div className="mt-auto border-t border-white/[0.07] px-2 pt-5 text-xs leading-5 text-slate-500">
          Кінотеатр · Коломия<br />Керування розкладом
        </div>
      </aside>

      <div className="min-h-screen md:pl-[216px]">
        <header className="flex min-h-[72px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-xs text-slate-400 sm:gap-5">
            <Link href="/" className="md:hidden text-base font-bold text-white">KinoKlick</Link>
            <span className="hidden md:inline">Адмін-панель</span>
            <span className="hidden md:inline">/</span>
            <span className="text-white">Сеанси</span>
          </div>
          <time className="text-xs text-slate-400">{todayLabel}</time>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">Розклад сеансів</h1>
              <p className="mt-2 text-sm text-slate-400">Створюйте сеанси та керуйте запланованими показами.</p>
            </div>
            <button type="button" disabled title="Підключимо після уточнення полів API сеансів і списку залів" className="h-11 cursor-not-allowed rounded-lg bg-[#e3262d]/50 px-5 text-sm font-semibold text-white/70 opacity-80">
              <span aria-hidden="true" className="mr-2">＋</span>Додати сеанс
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="Вигляд розкладу" className="inline-flex rounded-lg border border-white/[0.08] bg-[#111620] p-1">
              <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"} className={`flex h-9 items-center gap-2 rounded-md px-4 text-xs font-medium transition ${view === "list" ? "bg-[#26303d] text-white" : "text-slate-400 hover:text-white"}`}><ListIcon />Список</button>
              <button type="button" onClick={() => setView("calendar")} aria-pressed={view === "calendar"} className={`flex h-9 items-center gap-2 rounded-md px-4 text-xs font-medium transition ${view === "calendar" ? "bg-[#26303d] text-white" : "text-slate-400 hover:text-white"}`}><CalendarIcon />Календар</button>
            </div>
            <span className="text-xs text-slate-500">{view === "list" ? "Усі дати · спочатку найближчі" : "Перегляд на день"}</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_minmax(240px,1.7fr)_minmax(180px,1fr)_auto] lg:items-end">
            <label className="block text-xs text-slate-400">
              <span className="mb-2 block">Дата</span>
              <span className="relative block">
                <select value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); if (event.target.value) setCalendarDate(event.target.value); }} className="h-11 w-full appearance-none rounded-lg border border-[#283241] bg-[#121720] px-3 pr-9 text-sm text-slate-100 outline-none focus:border-slate-500">
                  <option value="">Усі дати</option>
                  {dates.map((date) => <option key={date} value={date}>{formatDate(`${date}T12:00:00`, { day: "numeric", month: "long", year: "numeric" })}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-3 text-slate-500">⌄</span>
              </span>
            </label>
            <label className="block text-xs text-slate-400">
              <span className="mb-2 block">Фільм</span>
              <span className="relative block">
                <select value={movieFilter} onChange={(event) => setMovieFilter(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[#283241] bg-[#121720] px-3 pr-9 text-sm text-slate-100 outline-none focus:border-slate-500">
                  <option value="">Усі фільми</option>
                  {movies.map((movie, index) => {
                    const id = idOf(movie.id ?? movie._id);
                    return id ? <option key={id} value={id}>{movie.title || `Фільм ${index + 1}`}</option> : null;
                  })}
                </select>
                <span className="pointer-events-none absolute right-3 top-3 text-slate-500">⌄</span>
              </span>
            </label>
            <label className="block text-xs text-slate-400">
              <span className="mb-2 block">Зал</span>
              <span className="relative block">
                <select value={hallFilter} onChange={(event) => setHallFilter(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[#283241] bg-[#121720] px-3 pr-9 text-sm text-slate-100 outline-none focus:border-slate-500">
                  <option value="">Усі зали</option>
                  {halls.map((hall) => <option key={hall.id} value={hall.id}>{hall.name}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-3 text-slate-500">⌄</span>
              </span>
            </label>
            <button type="button" onClick={resetFilters} className="h-11 px-2 text-left text-xs font-medium text-slate-400 transition hover:text-white">Скинути</button>
          </div>

          <section className="mt-8 min-h-[420px] overflow-hidden rounded-xl border border-[#26303d] bg-[#121720]" aria-label="Розклад сеансів">
            {loading ? (
              <div aria-label="Завантаження розкладу" className="p-5 sm:p-7">
                <h2 className="text-sm font-semibold">Завантажуємо розклад…</h2>
                <p className="mt-1 text-xs text-slate-400">Це може зайняти кілька секунд.</p>
                <div className="mt-10 divide-y divide-[#26303d]">
                  {[0, 1, 2, 3, 4].map((row) => <div key={row} className="grid grid-cols-[100px_minmax(180px,1fr)_70px_70px_120px] gap-5 py-5"><span className="h-3 animate-pulse rounded bg-[#283241]" /><span className="h-3 animate-pulse rounded bg-[#283241]" /><span className="h-3 animate-pulse rounded bg-[#283241]" /><span className="h-3 animate-pulse rounded bg-[#283241]" /><span className="h-3 animate-pulse rounded bg-[#283241]" /></div>)}
                </div>
              </div>
            ) : error ? (
              <div role="alert" className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-xl bg-red-500/10 text-2xl font-bold text-red-300">!</span>
                <h2 className="mt-7 text-xl font-bold">Не вдалося завантажити розклад</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">Перевір підключення до інтернету та спробуй ще раз.</p>
                <button type="button" onClick={() => void loadSchedule()} className="mt-6 rounded-lg bg-[#e3262d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f13a41]">Повторити спробу</button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-xl bg-[#202a38] text-2xl text-slate-300">—</span>
                <h2 className="mt-7 text-xl font-bold">Сеансів ще немає</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Коли розклад з’явиться в системі, він відобразиться тут.</p>
              </div>
            ) : view === "list" ? (
              <div>
                {filteredSessions.length === 0 ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                    <h2 className="text-lg font-semibold">За цими фільтрами сеансів немає</h2>
                    <button type="button" onClick={resetFilters} className="mt-3 text-sm text-rose-300 hover:text-rose-200">Скинути фільтри</button>
                  </div>
                ) : (
                  <>
                    {upcoming.length > 0 && <SessionTable title="Усі сеанси" count={upcoming.length} sessions={upcoming} now={now} />}
                    {past.length > 0 && <SessionTable title="Минулі сеанси" count={past.length} sessions={past} now={now} past />}
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="flex min-h-[62px] items-center justify-between border-b border-[#26303d] px-5">
                    <h2 className="text-sm font-semibold capitalize">{formatDate(`${calendarDate}T12:00:00`, { day: "numeric", month: "long", weekday: "long" })}</h2>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="Попередній день" onClick={() => setCalendarDate((value) => shiftDate(value, -1))} className="h-10 w-10 rounded-lg border border-[#283241] bg-[#171e29] text-lg text-slate-300 hover:text-white">‹</button>
                      <button type="button" onClick={() => setCalendarDate(dateKey(new Date()))} className="h-10 rounded-lg border border-[#283241] bg-[#171e29] px-4 text-xs font-medium text-slate-200 hover:text-white">Сьогодні</button>
                      <button type="button" aria-label="Наступний день" onClick={() => setCalendarDate((value) => shiftDate(value, 1))} className="h-10 w-10 rounded-lg border border-[#283241] bg-[#171e29] text-lg text-slate-300 hover:text-white">›</button>
                    </div>
                  </div>
                  {calendarHalls.length === 0 ? (
                    <div className="grid min-h-[320px] place-items-center text-sm text-slate-400">Для цього дня сеансів немає.</div>
                  ) : (
                    <div className="overflow-x-auto px-4 pb-6 pt-2">
                      <div className="grid min-w-[700px]" style={{ gridTemplateColumns: `52px repeat(${calendarHalls.length}, minmax(230px, 1fr))` }}>
                        <div className="h-12" />
                        {calendarHalls.map((hall) => <div key={hall.id} className="h-12 border-b border-[#26303d] px-4 py-3 text-xs font-medium text-slate-200">{hall.name}</div>)}
                        <div className="relative" style={{ height: HOUR_HEIGHT * HOURS.length }}>
                          {HOURS.map((hour) => <div key={hour} className="absolute right-2 -translate-y-1/2 text-[11px] text-slate-500" style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }}>{String(hour).padStart(2, "0")}:00</div>)}
                        </div>
                        {calendarHalls.map((hall) => (
                          <div key={hall.id} className="relative border-l border-[#26303d]" style={{ height: HOUR_HEIGHT * HOURS.length }}>
                            {HOURS.map((hour) => <div key={hour} className="absolute inset-x-0 border-t border-[#26303d]" style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }} />)}
                            {calendarSessions.filter((session) => session.hallId === hall.id).map((session) => {
                              const start = Math.max(0, Math.min(HOUR_HEIGHT * HOURS.length - 50, (timeInMinutes(session.startTime) - FIRST_HOUR * 60) / 60 * HOUR_HEIGHT));
                              const height = Math.max(54, Math.min(180, session.duration / 60 * HOUR_HEIGHT));
                              return (
                                <article key={session.id} className="absolute inset-x-2 z-[1] overflow-hidden rounded-lg border border-slate-600 bg-[#202b3a] p-3 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-[#e3262d]" style={{ top: start + 5, height }}>
                                  <p className="text-xs font-bold">{formatTime(session.startTime)}</p>
                                  <p className="mt-2 line-clamp-2 text-xs font-medium text-white">{session.movieTitle}</p>
                                  <p className="mt-2 text-[10px] text-slate-400">{session.price == null ? "Ціну не вказано" : `${session.price} грн`} · {normalizedStatus(session, now)}</p>
                                </article>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function SessionTable({ title, count, sessions, now, past = false }: { title: string; count: number; sessions: Session[]; now: number; past?: boolean }) {
  return (
    <section className={past ? "border-t-4 border-[#0b0e13]" : ""}>
      <div className="flex items-center justify-between border-b border-[#26303d] px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-slate-500">{count} {count === 1 ? "сеанс" : "сеансів"}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="text-[11px] text-slate-400">
            <tr className="border-b border-[#26303d]">
              <th className="px-5 py-3 font-medium">Дата й час</th>
              <th className="px-5 py-3 font-medium">Фільм</th>
              <th className="px-5 py-3 font-medium">Зал</th>
              <th className="px-5 py-3 font-medium">Ціна</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-[#26303d] last:border-0 hover:bg-white/[0.025]">
                <td className="whitespace-nowrap px-5 py-4 text-xs"><span className="block text-slate-200">{formatDate(session.startTime, { day: "2-digit", month: "2-digit", year: "numeric" })}</span><span className="mt-1 block text-slate-400">{formatTime(session.startTime)}</span></td>
                <td className="min-w-[230px] px-5 py-4"><p className="text-xs font-semibold text-slate-100">{session.movieTitle}</p><p className="mt-1 text-[11px] text-slate-500">{session.genres || "Кіносеанс"}</p></td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-300">{session.hallName}</td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-300">{session.price == null ? "—" : `${session.price} грн`}</td>
                <td className="px-5 py-4"><StatusBadge label={normalizedStatus(session, now)} /></td>
                <td className="px-5 py-4 text-xs text-slate-500">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
