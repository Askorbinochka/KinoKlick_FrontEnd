export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-[#0d1117] text-white border-b border-gray-800">
      {/* Логотип та Меню */}
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold text-red-600 cursor-pointer">КіноКлік</span>
        <nav className="hidden md:flex gap-6 text-sm text-gray-300">
          <a href="#" className="hover:text-white transition">Фільми</a>
          <a href="#" className="hover:text-white transition">Кінотеатри</a>
          <a href="#" className="hover:text-white transition">VIP зала</a>
          <a href="#" className="hover:text-white transition">Акції</a>
        </nav>
      </div>

      {/* Пошук та Локація */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Шукати фільми, жанри..."
            className="bg-[#161b22] text-sm text-gray-200 px-4 py-2 rounded-lg w-64 border border-gray-700 focus:outline-none focus:border-red-600"
          />
        </div>

        <button className="flex items-center gap-2 text-sm bg-[#161b22] px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500">
          <span>📍</span>
          <span>Коломия...</span>
        </button>

        <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm cursor-pointer">
          ТМ
        </div>
      </div>
    </header>
  );
}