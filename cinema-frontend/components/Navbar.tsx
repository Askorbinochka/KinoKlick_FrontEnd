"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/app/api";

type LocalUser = { name?: string; email?: string };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="mx-auto flex h-12 w-full max-w-[1200px] items-center gap-7 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-base font-extrabold tracking-tight text-white">КіноКлік</Link>

        <nav className="flex h-full items-center gap-6 text-xs text-slate-300" aria-label="Головна навігація">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`transition hover:text-white ${pathname === "/" ? "text-white" : "text-slate-400"}`}>Афіша</Link>
          <Link href="/tickets/my" aria-current={pathname.startsWith("/tickets") ? "page" : undefined} className={`transition hover:text-white ${pathname.startsWith("/tickets") ? "text-white" : "text-slate-400"}`}>Мої квитки</Link>
        </nav>

        <div className="ml-auto hidden text-[11px] text-slate-400 sm:block">Коломия</div>

        {user ? (
          <div className="relative">
            <button type="button" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((open) => !open)} className="flex h-8 items-center gap-2 rounded-md border border-white/[0.06] bg-[#19202c] px-3 text-xs font-semibold text-white transition hover:border-white/15">
              {initials}<span aria-hidden="true" className="text-[10px] text-slate-400">⌄</span>
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-white/[0.08] bg-[#121721] p-2 shadow-2xl">
                <div className="border-b border-white/[0.07] px-3 py-2">
                  <p className="truncate text-sm font-semibold text-white">{user.name || "Ваш акаунт"}</p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
                <Link role="menuitem" href="/tickets/my" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-lg bg-[#19202c] px-3 py-2.5 text-sm text-slate-200 hover:text-white">Мої квитки</Link>
                <button role="menuitem" type="button" onClick={signOut} className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">Вийти</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md border border-white/[0.06] bg-[#19202c] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#222b39]">Увійти</Link>
            <Link href="/register" className="rounded-md bg-[#e3262d] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#f13a41]">Реєстрація</Link>
          </div>
        )}
      </div>
    </header>
  );
}
