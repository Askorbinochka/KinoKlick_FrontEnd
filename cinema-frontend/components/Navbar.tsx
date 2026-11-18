"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { API_URL } from "@/app/api";
import MovieSearch from "@/components/MovieSearch";

type LocalUser = { name?: string; email?: string; role?: string };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const syncProfile = async () => {
      const token = localStorage.getItem("kinoklik-token");
      if (!token) {
        setUser(null);
        localStorage.removeItem("kinoklik-user");
        return;
      }

      try {
        const stored = localStorage.getItem("kinoklik-user");
        if (stored && !cancelled) setUser(JSON.parse(stored) as LocalUser);
      } catch {
        localStorage.removeItem("kinoklik-user");
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 401) {
          localStorage.removeItem("kinoklik-token");
          localStorage.removeItem("kinoklik-user");
          if (!cancelled) setUser(null);
          return;
        }
        if (!response.ok) return;
        const profile = await response.json();
        const currentUser = {
          name: [profile.firstName, profile.lastName].filter(Boolean).join(" "),
          email: profile.email,
          role: profile.role,
        };
        localStorage.setItem("kinoklik-user", JSON.stringify(currentUser));
        if (!cancelled) setUser(currentUser);
      } catch {
        // Keep the cached profile visible while the API is unavailable.
      }
    };

    void syncProfile();
    window.addEventListener("kinoklik-auth-change", syncProfile);
    return () => {
      cancelled = true;
      window.removeEventListener("kinoklik-auth-change", syncProfile);
    };
  }, []);

  const signOut = () => {
    localStorage.removeItem("kinoklik-user");
    localStorage.removeItem("kinoklik-token");
    setUser(null);
    setMenuOpen(false);
    setMobileNavOpen(false);
    window.dispatchEvent(new Event("kinoklik-auth-change"));
    router.push("/");
  };

  const initials = user?.name
    ?.split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "AC";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#121721]/95 text-white backdrop-blur-xl">
      <div className="relative mx-auto flex min-h-12 w-full max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:h-12 md:flex-nowrap md:gap-4 md:px-6 md:py-0 lg:gap-7 lg:px-8">
        <Link href="/" className="shrink-0 text-base font-extrabold tracking-tight text-white">КіноКлік</Link>

        <nav className="hidden h-full shrink-0 items-center gap-5 text-xs text-slate-300 md:flex lg:gap-6" aria-label="Головна навігація">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`transition hover:text-white ${pathname === "/" ? "text-white" : "text-slate-400"}`}>Афіша</Link>
          <Link href="/tickets/my" aria-current={pathname.startsWith("/tickets") ? "page" : undefined} className={`transition hover:text-white ${pathname.startsWith("/tickets") ? "text-white" : "text-slate-400"}`}>Мої квитки</Link>
        </nav>

        <div className="order-3 basis-full md:order-none md:min-w-[150px] md:flex-1">
          <Suspense fallback={<div aria-hidden="true" className="h-9 w-full rounded-lg bg-[#19202c] md:min-w-[150px] md:max-w-[320px] md:flex-1" />}>
            <MovieSearch />
          </Suspense>
        </div>

        <div className="ml-auto hidden shrink-0 text-[11px] text-slate-400 md:block">Коломия</div>

        <button type="button" aria-label={mobileNavOpen ? "Закрити меню" : "Відкрити меню"} aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" onClick={() => setMobileNavOpen((open) => !open)} className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-[#19202c] text-lg text-slate-200 md:ml-0 md:hidden">
          {mobileNavOpen ? "×" : "☰"}
        </button>

        {user ? (
          <div className="relative order-2 shrink-0 md:order-none">
            <button type="button" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((open) => !open)} className="flex h-10 items-center gap-2 rounded-md border border-white/[0.06] bg-[#19202c] px-3 text-xs font-semibold text-white transition hover:border-white/15 md:h-8">
              {initials}<span aria-hidden="true" className="text-[10px] text-slate-400">⌄</span>
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-white/[0.08] bg-[#121721] p-2 shadow-2xl">
                <div className="border-b border-white/[0.07] px-3 py-2">
                  <p className="truncate text-sm font-semibold text-white">{user.name || "Ваш акаунт"}</p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
                <Link role="menuitem" href="/tickets/my" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-lg bg-[#19202c] px-3 py-2.5 text-sm text-slate-200 hover:text-white">Мої квитки</Link>
                {["ADMIN", "MODERATOR"].includes(user.role?.toUpperCase() || "") && <>
                  <Link role="menuitem" href="/admin/sessions" onClick={() => setMenuOpen(false)} className="mt-1 block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">Адмін-панель</Link>
                  <Link role="menuitem" href="/admin/movies" onClick={() => setMenuOpen(false)} className="mt-1 block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">Додати фільм</Link>
                </>}
                <button role="menuitem" type="button" onClick={signOut} className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">Вийти</button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link href="/login" className="rounded-md border border-white/[0.06] bg-[#19202c] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#222b39]">Увійти</Link>
            <Link href="/register" className="rounded-md bg-[#e3262d] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#f13a41]">Реєстрація</Link>
          </div>
        )}

        {mobileNavOpen && <nav id="mobile-navigation" aria-label="Мобільна навігація" className="absolute left-4 right-4 top-full z-50 rounded-xl border border-white/[0.08] bg-[#121721] p-2 shadow-2xl md:hidden">
          <Link href="/" onClick={() => setMobileNavOpen(false)} aria-current={pathname === "/" ? "page" : undefined} className="block rounded-lg px-3 py-3 text-sm text-slate-200 hover:bg-white/[0.05]">Афіша</Link>
          <Link href="/tickets/my" onClick={() => setMobileNavOpen(false)} aria-current={pathname.startsWith("/tickets") ? "page" : undefined} className="block rounded-lg px-3 py-3 text-sm text-slate-200 hover:bg-white/[0.05]">Мої квитки</Link>
          {user && ["ADMIN", "MODERATOR"].includes(user.role?.toUpperCase() || "") && <>
            <Link href="/admin/sessions" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-slate-200 hover:bg-white/[0.05]">Адмін-панель</Link>
            <Link href="/admin/movies" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-slate-200 hover:bg-white/[0.05]">Додати фільм</Link>
          </>}
          {!user && <div className="mt-1 grid grid-cols-2 gap-2 border-t border-white/[0.07] p-2 pt-3"><Link href="/login" onClick={() => setMobileNavOpen(false)} className="rounded-lg bg-[#19202c] px-3 py-2.5 text-center text-sm font-semibold text-slate-200">Увійти</Link><Link href="/register" onClick={() => setMobileNavOpen(false)} className="rounded-lg bg-[#e3262d] px-3 py-2.5 text-center text-sm font-semibold text-white">Реєстрація</Link></div>}
          {user && <button type="button" onClick={signOut} className="mt-1 w-full border-t border-white/[0.07] px-3 py-3 text-left text-sm text-slate-300">Вийти</button>}
        </nav>}
      </div>
    </header>
  );
}
