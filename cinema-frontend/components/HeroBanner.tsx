export default function HeroBanner() {
  return (
    <section className="relative w-full rounded-2xl overflow-hidden p-8 md:p-12 my-6 border border-gray-800">
      {/* Фонова картинка */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/spiderman.jpg" 
          alt="Spider-Man" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/80 to-transparent"></div>
      </div>

      {/* Текст та кнопки */}
      <div className="max-w-xl z-10 relative space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-yellow-500/20 text-yellow-400 font-semibold px-2.5 py-1 rounded-md border border-yellow-500/30">
            ★ 8.8 IMDb
          </span>
          <span className="bg-gray-800/80 text-gray-300 px-2.5 py-1 rounded-md backdrop-blur">Пригоди</span>
          <span className="bg-gray-800/80 text-gray-300 px-2.5 py-1 rounded-md backdrop-blur">Екшн</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
          Людина-павук: <br />
          <span className="text-gray-200">Абсолютно новий день</span>
        </h1>

        <p className="text-sm text-gray-300 line-clamp-3">
          Минуло чотири роки після подій фільму «Додому шляху немає». Пітер Паркер живе в самотності...
        </p>

        <div className="flex items-center gap-4 pt-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg shadow-red-600/30">
            🎟️ Забронювати квитки
          </button>
          <button className="border border-gray-600 hover:border-gray-400 text-white font-medium px-6 py-3 rounded-xl transition bg-black/40 backdrop-blur">
            ▶ Дивитись трейлер
          </button>
        </div>
      </div>
    </section>
  );
}