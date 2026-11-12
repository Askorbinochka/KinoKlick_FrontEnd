import Link from "next/link";
import { Movie } from "@/app/page";

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const imageUrl = movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200";

  return (
    <section className="relative flex min-h-[290px] items-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl sm:min-h-[350px]">
  
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl} 
          alt={movie.title} 
          className="h-full w-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-2xl space-y-3 px-5 py-8 sm:px-9 md:px-12">
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="rounded bg-red-600 px-2.5 py-1 font-medium text-white">ЗАРАЗ У КІНО</span>
          {Array.isArray(movie.genres) && (
            <span className="bg-slate-800/80 text-gray-300 px-2.5 py-1 rounded">
              {movie.genres.join(", ")}
            </span>
          )}
        </div>

        <h1 className="max-w-xl text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          {movie.title}
        </h1>

        <p className="line-clamp-3 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
          {movie.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link 
            href={`/movies/${movie.id}`}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-red-500"
          >
            <span>Забронювати квитки</span>
          </Link>

          <Link 
            href={`/movies/${movie.id}`}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            <span>Дивитись деталі</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
