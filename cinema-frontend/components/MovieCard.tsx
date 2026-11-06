import Link from "next/link";
import { Movie } from "@/app/page";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600";
  
  const genresText = Array.isArray(movie.genres) 
    ? movie.genres.join(", ") 
    : movie.genres;
    
  return (
    <div className="bg-[#121721] rounded-xl overflow-hidden border border-gray-800 flex flex-col justify-between hover:border-slate-700 transition duration-300">
      {/* Загортаємо постер і назву у посилання, щоб при кліку на них відкривалося детально */}
      <Link href={`/movies/${movie.id}`} className="group block">
        <div className="relative h-96 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-red-500 transition">
            {movie.title}
          </h3>
          
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className="line-clamp-1">{genresText}</span>
            <div className="flex items-center space-x-1 text-yellow-500 font-medium">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>{movie.rating}</span>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">РОЗКЛАД</span>
            <div className="flex gap-1.5">
              <span className="bg-[#1a2230] text-gray-300 text-xs py-1 px-2 rounded border border-gray-700/50">14:30</span>
              <span className="bg-[#1a2230] text-gray-300 text-xs py-1 px-2 rounded border border-gray-700/50">17:15</span>
              <span className="bg-[#1a2230] text-gray-300 text-xs py-1 px-2 rounded border border-gray-700/50">20:00</span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Нижня частина з ціною та кнопкою */}
      <div className="p-4 pt-3 flex justify-between items-center border-t border-gray-800/60 mt-2">
        <div className="text-[11px] text-gray-400">
          Квитки від <span className="text-white font-bold text-xs block">150 грн</span>
        </div>
        <Link 
          href={`/movies/${movie.id}`}
          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition"
        >
          Забронювати
        </Link>
      </div>
    </div>
  );
}