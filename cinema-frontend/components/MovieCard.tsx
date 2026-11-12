import Link from "next/link";
import type { Movie } from "@/app/page";

type MovieSession = {
  id: string;
  startTime: string;
  price?: number;
  basePrice?: number;
  ticketPrice?: number;
  pricePerSeat?: number;
};

type MovieCardProps = {
  movie: Movie;
  sessions: MovieSession[];
  selectedDate: string;
};

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

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  });
}

export default function MovieCard({ movie, sessions, selectedDate }: MovieCardProps) {
  const imageUrl = movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600";
  const genres = Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres || "";
  const ageRating = movie.ageRating ?? movie.ageRestriction;
  const upcomingSessions = sessions.filter((session) => new Date(session.startTime).getTime() >= Date.now());
  const prices = sessions.map((session) => Number(session.price ?? session.basePrice ?? session.ticketPrice ?? session.pricePerSeat)).filter((price) => Number.isFinite(price) && price > 0);
  const lowestPrice = prices.length ? Math.min(...prices) : null;
  const daySessions = upcomingSessions.filter((session) => dateKey(session.startTime) === selectedDate);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#111722] transition hover:border-slate-600">
      <Link href={`/movies/${movie.id}`} className="block overflow-hidden">
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
          <img
            src={imageUrl}
            alt={`Постер фільму «${movie.title}»`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          {ageRating != null && <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">{ageRating}+</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/movies/${movie.id}`} className="line-clamp-1 text-sm font-bold text-white hover:text-red-400">
          {movie.title}
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-400">
          <span className="line-clamp-1">{genres}</span>
          {movie.rating != null && <span className="shrink-0 text-amber-400">★ {movie.rating}</span>}
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Сеанси</p>
          {daySessions.length ? (
            <div className="flex flex-wrap gap-1.5">
              {daySessions.slice(0, 4).map((session) => (
                <Link
                  key={session.id}
                  href={`/movies/${movie.id}`}
                  className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 text-[10px] text-slate-200 hover:border-red-500 hover:text-white"
                >
                  {formatTime(session.startTime)}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500">Сеансів на цю дату немає</p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-800 pt-3 mt-3">
          <p className="text-[10px] text-slate-400">Квитки від <span className="block text-xs font-bold text-white">{lowestPrice !== null ? `${lowestPrice} грн` : "—"}</span></p>
          <Link href={`/movies/${movie.id}`} className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-red-500">
            Забронювати
          </Link>
        </div>
      </div>
    </article>
  );
}
