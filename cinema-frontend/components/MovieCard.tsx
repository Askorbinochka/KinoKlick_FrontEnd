import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/app/page";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = movie.posterUrl || (movie as any).image || "/placeholder.jpg";
  
  const genresText = Array.isArray(movie.genres) 
    ? movie.genres.join(", ") 
    : movie.genres;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 flex flex-col justify-between">
      <div>
        <div className="relative h-96 w-full">
          <img
            src={imageUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-2">{movie.title}</h2>
          <p className="text-gray-400 text-sm mb-2">{genresText}</p>
          <div className="flex justify-between items-center text-sm text-gray-300">

  <div className="flex items-center space-x-1">
    <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
    <span>{movie.rating}</span>
  </div>

  <div className="flex items-center space-x-1">
    <svg className="w-4 h-4 text-gray-400 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
    <span>{movie.duration} хв</span>
  </div>
</div>
        </div>
      </div>
      
      <div className="p-4 pt-0">
        <Link 
          href={`/movies/${movie.id}`}
          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition-colors"
        >
          Купити квиток
        </Link>
      </div>
    </div>
  );
}