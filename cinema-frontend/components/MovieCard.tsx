interface MovieCardProps {
  title: string;
  genre: string;
  rating: number;
  sessions: string[];
  price: number;
  image: string;
}

export default function MovieCard({ title, genre, rating, sessions, price, image }: MovieCardProps) {
  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-700 transition">
      <div className="w-full h-72 rounded-xl mb-4 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Інфо про фільм */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-white text-base line-clamp-1">{title}</h3>
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
            ★ {rating}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">{genre}</p>

        {/* Розклад */}
        <p className="text-[10px] text-gray-500 font-semibold mb-2 tracking-wider">РОЗКЛАД</p>
        <div className="flex gap-2 mb-4">
          {sessions.map((time, idx) => (
            <span key={idx} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700">
              {time}
            </span>
          ))}
        </div>
      </div>

      {/* Ціна */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-800/80">
        <span className="text-xs text-gray-400">Квитки від</span>
        <span className="text-sm font-bold text-white">{price} грн</span>
      </div>
    </div>
  );
}