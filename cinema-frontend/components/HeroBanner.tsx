export default function HeroBanner() {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden p-8 md:p-12 my-6 bg-[#121621] border border-gray-800/80">
 
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/spiderman.jpg" 
          alt="Людина-павук" 
          className="w-full h-full object-cover object-right-top"
        />
   
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/85 to-transparent w-full md:w-3/4"></div>
      </div>

      <div className="max-w-lg z-10 relative space-y-4">
        {/* Теги */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-yellow-500/20 text-yellow-400 font-semibold px-2.5 py-1 rounded-md border border-yellow-500/30">
            ★ 8.8 IMDb
          </span>
          <span className="bg-gray-800/80 text-gray-300 px-2.5 py-1 rounded-md backdrop-blur">
            Пригоди
          </span>
          <span className="bg-gray-800/80 text-gray-300 px-2.5 py-1 rounded-md backdrop-blur">
            Екшн
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
          Людина-павук: <br />
          <span className="text-gray-100">Абсолютно новий день</span>
        </h1>

        <p className="text-xs md:text-sm text-gray-300/90 leading-relaxed line-clamp-4">
          Минуло чотири роки після подій фільму «Додому шляху немає». Пітер Паркер живе в самотності, бо добровільно стер себе з пам'яті тих, кого любить. Він захищає Нью-Йорк, який більше не пам'ятає його імені.
        </p>

        {/* Кнопки */}
       <div className="flex items-center gap-4 pt-2">
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-red-600/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
            <span>Забронювати квитки</span>
          </button>

          <button className="flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-white font-medium text-sm px-6 py-3 rounded-xl transition bg-black/40 backdrop-blur">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
            <span>Дивитись трейлер</span>
          </button>
        </div>
      </div>
    </section>
  );
}