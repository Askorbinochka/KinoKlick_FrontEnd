import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#0b0e14]/95 text-white backdrop-blur">
      <div className="mx-auto flex h-11 w-full max-w-[1440px] items-center gap-4 px-3 sm:gap-5 sm:px-5 lg:px-8">
        <Link href="/" className="shrink-0 text-[15px] font-bold tracking-tight text-red-500 sm:text-base">
          КіноКлік
        </Link>

        <nav className="hidden items-center gap-4 text-xs text-slate-300 md:flex lg:gap-5" aria-label="Головна навігація">
          <Link href="/" className="text-red-400 hover:text-red-300">Фільми</Link>
          <span className="hover:text-white">Кінотеатри</span>
          <span className="hover:text-white">VIP зала</span>
          <span className="hover:text-white">Акції</span>
        </nav>

        <label className="ml-auto flex min-w-0 flex-1 items-center md:ml-0 md:max-w-[340px]">
          <span className="sr-only">Пошук фільмів</span>
          <input
            type="search"
            placeholder="Пошук фільмів, жанрів…"
            className="h-8 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 outline-none placeholder:text-slate-400 focus:border-slate-600"
          />
        </label>

        <button type="button" className="hidden h-8 shrink-0 items-center rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 hover:border-slate-600 sm:flex">
          Коломия
        </button>
        <button type="button" aria-label="Меню акаунта" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-[11px] font-semibold text-slate-200 hover:border-slate-600">
          AC
        </button>
      </div>
    </header>
  );
}
