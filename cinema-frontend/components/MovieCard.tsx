import Link from "next/link";

interface MovieCardProps {
  id: number;
  title: string;
  genre: string;
  rating: number;
  sessions: string[];
  price: number;
  image: string;
}

export default function MovieCard({ id, title, genre, rating, sessions, price, image }: MovieCardProps) {
  return (
    <Link href={`/movies/${id}`} className="bg-[#131822] border border-gray-800/80 rounded-2xl p-3.5 flex flex-col justify-between hover:border-gray-700 transition group block">
      {/* Постер фільму */}
      <div className="w-full aspect-[2/3] rounded-xl mb-3 overflow-hidden relative bg-gray-900">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
        />
      </div>

      {/* Інформація про фільм */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-white text-base line-clamp-1 mb-1">{title}</h3>
          
          <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
            <span className="line-clamp-1">{genre}</span>
            <span className="text-yellow-400 font-semibold flex items-center gap-1 shrink-0">
              ★ {rating}
            </span>
          </div>

          {/* Розклад сеансів */}
          <p className="text-[10px] text-gray-500 font-semibold mb-2 tracking-wider uppercase">
            РОЗКЛАД
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sessions.map((time, idx) => (
              <span 
                key={idx} 
                className="text-xs bg-[#1a202c] text-gray-300 px-2.5 py-1 rounded-md border border-gray-800"
              >
                {time}
              </span>
            ))}
          </div>
        </div>

        {/* Ціна квитків */}
        <div className="flex justify-between items-baseline pt-2 border-t border-gray-800/60">
          <span className="text-xs text-gray-400">Квитки від</span>
          <span className="text-base font-bold text-white">{price} грн</span>
        </div>
      </div>
    </Link>
  );
}