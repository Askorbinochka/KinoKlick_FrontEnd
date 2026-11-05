import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/app/page";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  // Підтягуємо posterUrl з бекенду (з фолбеком на image, якщо десь залишилася стара назва)
  const imageUrl = movie.posterUrl || (movie as any).image || "/placeholder.jpg";
  
  // Форматуємо жанри: якщо масив — об'єднуємо через кому, якщо рядок — залишаємо як є
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
            <span>⭐ {movie.rating}</span>
            <span>⏱️ {movie.duration} хв</span>
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