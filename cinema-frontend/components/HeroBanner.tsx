import Link from "next/link";
import Image from "next/image";
import { Movie } from "@/app/page";

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const imageUrl = movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200";

  return (
    <section className="relative flex min-h-[360px] items-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#121720] shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:min-h-[430px]">
  
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl} 
          alt={movie.title} 
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_38%] opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1016] via-[#0d1016]/85 to-[#0d1016]/15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1016]/55 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-2xl space-y-3 px-5 py-8 sm:px-9 md:px-12">
        <div className="flex flex-wrap gap-2 text-[10px]">
          {movie.rating != null && <span className="rounded bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-300">★ {movie.rating} IMDb</span>}
          {Array.isArray(movie.genres) && (
            <span className="rounded bg-slate-800/80 px-2.5 py-1 text-gray-300">
              {movie.genres.join(", ")}
            </span>
          )}
          {(movie.ageRating || movie.ageRestriction) != null && <span className="rounded bg-slate-800/80 px-2.5 py-1 text-gray-300">{movie.ageRating || movie.ageRestriction}+</span>}
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
            className="flex items-center gap-2 rounded-lg bg-[#e3262d] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#f13a41]"
          >
            <span>Обрати сеанс</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
