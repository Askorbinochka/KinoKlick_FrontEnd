import Link from "next/link";
import { Movie } from "@/app/page";

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const imageUrl = movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl h-[450px] flex items-center">
  
      <div className="absolute inset-0 z-0">
        <img 
          src={imageUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/80 to-transparent"></div>
      </div>

      <div className="relative z-10 px-8 md:px-12 max-w-2xl space-y-4">
        <div className="flex gap-2 text-xs">
          <span className="bg-red-600 text-white px-2.5 py-1 rounded font-medium">ЗАРАЗ У КІНО</span>
          {Array.isArray(movie.genres) && (
            <span className="bg-slate-800/80 text-gray-300 px-2.5 py-1 rounded">
              {movie.genres.join(", ")}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          {movie.title}
        </h1>

        <p className="text-gray-300 text-sm md:text-base line-clamp-3 leading-relaxed">
          {movie.description}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link 
            href={`/movies/${movie.id}`}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition flex items-center gap-2"
          >
            <span>Забронювати квитки</span>
          </Link>

          <Link 
            href={`/movies/${movie.id}`}
            className="bg-slate-800/80 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            <span>Дивитись деталі</span>
          </Link>
        </div>
      </div>
    </div>
  );
}