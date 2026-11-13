"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MovieSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const [query, setQuery] = useState(currentSearch);

  useEffect(() => setQuery(currentSearch), [currentSearch]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/?search=${encodeURIComponent(value)}` : "/");
  };

  const clearSearch = () => {
    setQuery("");
    router.push("/");
  };

  return (
    <form onSubmit={submitSearch} role="search" className="flex h-9 min-w-[180px] max-w-[320px] flex-1 items-center rounded-lg border border-white/[0.07] bg-[#19202c] px-3 transition focus-within:border-slate-500">
      <input
        type="text"
        aria-label="Пошук фільмів за назвою або описом"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Знайти фільм…"
        className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
      />
      {query && (
        <button type="button" onClick={clearSearch} aria-label="Очистити пошук" className="mr-2 text-sm text-slate-400 hover:text-white">×</button>
      )}
      <button type="submit" aria-label="Шукати фільми" className="text-slate-400 transition hover:text-white">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
