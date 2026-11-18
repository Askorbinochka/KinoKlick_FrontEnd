"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/api";

type MovieForm = {
  title: string;
  description: string;
  posterUrl: string;
  genres: string;
  duration: string;
  rating: string;
  trailerUrl: string;
  director: string;
  language: string;
  ageRestriction: string;
};

type Movie = MovieForm & { id: string };
type Editor = { mode: "create" } | { mode: "edit"; movie: Movie } | null;

const EMPTY_FORM: MovieForm = {
  title: "", description: "", posterUrl: "", genres: "", duration: "", rating: "",
  trailerUrl: "", director: "", language: "", ageRestriction: "",
};

const inputClass = "mt-2 h-11 w-full rounded-lg border border-[#283241] bg-[#0d1118] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500";
const labelClass = "block text-sm font-medium text-slate-300";

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  for (const key of ["movies", "items", "data", "results"]) {
    if (Array.isArray(data[key])) return data[key] as T[];
  }
  return [];
}

function normalizeMovies(payload: unknown): Movie[] {
  return asList<Record<string, unknown>>(payload).flatMap((item) => {
    const id = item.id ?? item._id;
    if (id == null) return [];
    const genres = Array.isArray(item.genres) ? item.genres.map(String).join(", ") : String(item.genres ?? "");
    return [{
      id: String(id),
      title: String(item.title ?? ""),
      description: String(item.description ?? ""),
      posterUrl: String(item.posterUrl ?? ""),
      genres,
      duration: item.duration == null ? "" : String(item.duration),
      rating: item.rating == null ? "" : String(item.rating),
      trailerUrl: String(item.trailerUrl ?? ""),
      director: String(item.director ?? ""),
      language: String(item.language ?? ""),
      ageRestriction: String(item.ageRestriction ?? item.ageRating ?? ""),
    }];
  });
}

function responseMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const message = record.message ?? record.error;
  return Array.isArray(message) ? message.join(" ") : typeof message === "string" ? message : "";
}

function toPayload(form: MovieForm) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    posterUrl: form.posterUrl.trim(),
    genres: form.genres.split(",").map((genre) => genre.trim()).filter(Boolean),
    duration: Number(form.duration),
    rating: Number(form.rating),
    trailerUrl: form.trailerUrl.trim(),
    director: form.director.trim(),
    language: form.language.trim(),
    ageRestriction: Number(form.ageRestriction),
  };
}

function Icon({ children }: { children: string }) {
  return <span aria-hidden="true" className="inline-flex w-5 justify-center">{children}</span>;
}

export default function AdminMoviesPage() {
  const router = useRouter();
  const [access, setAccess] = useState<"checking" | "allowed" | "denied" | "error">("checking");
  const [userRole, setUserRole] = useState("");
  const [accessError, setAccessError] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editor, setEditor] = useState<Editor>(null);
  const [form, setForm] = useState<MovieForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<Movie | null>(null);
  const [deletingNow, setDeletingNow] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const checkAccess = useCallback(async () => {
    setAccess("checking");
    setAccessError("");
    const token = localStorage.getItem("kinoklik-token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/admin/movies")}`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401) {
        localStorage.removeItem("kinoklik-token");
        localStorage.removeItem("kinoklik-user");
        window.dispatchEvent(new Event("kinoklik-auth-change"));
        router.replace(`/login?next=${encodeURIComponent("/admin/movies")}`);
        return;
      }
      if (!response.ok) throw new Error("Не вдалося перевірити права доступу. Спробуйте ще раз.");

      const profile = await response.json() as { role?: string };
      const role = profile.role?.toUpperCase() || "";
      setUserRole(role);
      setAccess(role === "ADMIN" || role === "MODERATOR" ? "allowed" : "denied");
    } catch (cause) {
      setAccessError(cause instanceof Error ? cause.message : "Не вдалося перевірити права доступу.");
      setAccess("error");
    }
  }, [router]);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`${API_URL}/movies`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload) || "Не вдалося завантажити каталог фільмів.");
      setMovies(normalizeMovies(payload));
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "Не вдалося завантажити каталог фільмів.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void checkAccess(); }, [checkAccess]);
  useEffect(() => { if (access === "allowed") void loadMovies(); }, [access, loadMovies]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setNotice("");
    setEditor({ mode: "create" });
  };

  const openEdit = (movie: Movie) => {
    setForm({ ...movie });
    setFormError("");
    setNotice("");
    setEditor({ mode: "edit", movie });
  };

  const updateField = (field: keyof MovieForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  };

  const saveMovie = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    setFormError("");
    setNotice("");
    const token = localStorage.getItem("kinoklik-token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/admin/movies")}`);
      setSaving(false);
      return;
    }

    const isEdit = editor.mode === "edit";
    const url = isEdit ? `${API_URL}/movies/${encodeURIComponent(editor.movie.id)}` : `${API_URL}/movies`;
    try {
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(toPayload(form)),
      });
      const payload = await response.json().catch(() => null);
      if (response.status === 401) {
        localStorage.removeItem("kinoklik-token");
        localStorage.removeItem("kinoklik-user");
        window.dispatchEvent(new Event("kinoklik-auth-change"));
        router.replace(`/login?next=${encodeURIComponent("/admin/movies")}`);
        return;
      }
      if (response.status === 403) throw new Error(isEdit ? "Недостатньо прав для редагування фільму." : "Додавати фільми можуть адміністратор або модератор.");
      if (!response.ok) throw new Error(responseMessage(payload) || `Не вдалося ${isEdit ? "зберегти зміни" : "додати фільм"}. Перевірте дані й спробуйте ще раз.`);

      setEditor(null);
      setForm(EMPTY_FORM);
      setNotice(isEdit ? `Зміни для фільму «${form.title.trim()}» збережено.` : `Фільм «${form.title.trim()}» додано до каталогу.`);
      await loadMovies();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Не вдалося зберегти фільм.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMovie = async () => {
    if (!deleting || userRole !== "ADMIN") return;
    setDeletingNow(true);
    setDeleteError("");
    const token = localStorage.getItem("kinoklik-token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/admin/movies")}`);
      setDeletingNow(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/movies/${encodeURIComponent(deleting.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => null);
      if (response.status === 401) {
        localStorage.removeItem("kinoklik-token");
        localStorage.removeItem("kinoklik-user");
        window.dispatchEvent(new Event("kinoklik-auth-change"));
        router.replace(`/login?next=${encodeURIComponent("/admin/movies")}`);
        return;
      }
      if (response.status === 403) throw new Error("Видаляти фільми може лише адміністратор.");
      if (!response.ok) throw new Error(responseMessage(payload) || "Бекенд не зміг видалити фільм. Перевірте, чи немає пов’язаних сеансів або квитків.");

      setNotice(`Фільм «${deleting.title}» видалено.`);
      setDeleting(null);
      await loadMovies();
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Не вдалося видалити фільм.");
    } finally {
      setDeletingNow(false);
    }
  };

  if (access === "checking") return <div className="grid min-h-screen place-items-center bg-[#0b0e13] px-5 text-sm text-slate-400">Перевіряємо доступ до адмін-панелі…</div>;
  if (access === "denied") {
    return <main className="grid min-h-screen place-items-center bg-[#0b0e13] px-5 text-slate-100"><section className="w-full max-w-md rounded-xl border border-[#26303d] bg-[#121720] p-7 text-center"><h1 className="text-xl font-bold">Немає доступу до адмін-панелі</h1><p className="mt-3 text-sm leading-6 text-slate-400">Керувати фільмами може адміністратор або модератор.</p><Link href="/" className="mt-6 inline-flex rounded-lg bg-[#19202c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#222b39]">Повернутися до афіші</Link></section></main>;
  }
  if (access === "error") {
    return <main className="grid min-h-screen place-items-center bg-[#0b0e13] px-5 text-slate-100"><section role="alert" className="w-full max-w-md rounded-xl border border-[#26303d] bg-[#121720] p-7 text-center"><h1 className="text-xl font-bold">Не вдалося перевірити доступ</h1><p className="mt-3 text-sm text-slate-400">{accessError}</p><button type="button" onClick={() => void checkAccess()} className="mt-6 rounded-lg bg-[#e3262d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#f13a41]">Спробувати ще раз</button></section></main>;
  }

  return (
    <div className="min-h-screen bg-[#0b0e13] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[216px] flex-col border-r border-white/[0.06] bg-[#111620] px-4 py-7 md:flex">
        <Link href="/" className="px-2 text-[25px] font-extrabold tracking-tight text-white">KinoKlick</Link>
        <span className="mt-1 px-2 text-[10px] font-semibold tracking-wide text-slate-500">АДМІН-ПАНЕЛЬ</span>
        <nav className="mt-11 space-y-1" aria-label="Адмін-навігація">
          <Link href="/admin/sessions" className="flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white"><Icon>▦</Icon>Сеанси</Link>
          <Link href="/admin/movies" aria-current="page" className="flex h-12 items-center gap-3 rounded-lg border-l-[3px] border-[#e3262d] bg-[#2b1b22] px-3 text-sm font-semibold text-rose-200"><Icon>▣</Icon>Фільми</Link>
        </nav>
        <div className="mt-auto border-t border-white/[0.07] px-2 pt-5 text-xs leading-5 text-slate-500">Кінотеатр · Коломия<br />Керування каталогом</div>
      </aside>

      <div className="min-h-screen md:pl-[216px]">
        <header className="flex min-h-[72px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-xs text-slate-400 sm:gap-5"><Link href="/" className="text-base font-bold text-white md:hidden">KinoKlick</Link><span className="hidden md:inline">Адмін-панель</span><span className="hidden md:inline">/</span><span className="text-white">Фільми</span></div>
          <Link href="/admin/sessions" className="text-xs text-slate-400 transition hover:text-white">До сеансів →</Link>
        </header>

        <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">Керування каталогом</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-[30px]">Фільми</h1><p className="mt-2 text-sm text-slate-400">Додавайте й оновлюйте фільми в афіші.</p></div>
            <button type="button" onClick={openCreate} className="h-11 rounded-lg bg-[#e3262d] px-5 text-sm font-semibold text-white transition hover:bg-[#f13a41]"><span aria-hidden="true" className="mr-2">＋</span>Додати фільм</button>
          </div>

          {notice && <div role="status" className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">✓　{notice}</div>}
          {loadError && <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"><span>{loadError}</span><button type="button" onClick={() => void loadMovies()} className="font-semibold underline">Спробувати ще раз</button></div>}

          <section className="mt-8 overflow-hidden rounded-xl border border-white/[0.07] bg-[#121720]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6"><h2 className="font-semibold text-white">Каталог</h2><span className="text-xs text-slate-500">{loading ? "Завантажуємо…" : `${movies.length} фільмів`}</span></div>
            {loading ? <div className="p-8 text-center text-sm text-slate-400">Завантажуємо каталог…</div> : movies.length === 0 ? <div className="p-10 text-center"><p className="text-sm text-slate-300">У каталозі поки немає фільмів.</p><button type="button" onClick={openCreate} className="mt-4 rounded-lg bg-[#e3262d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#f13a41]">Додати перший фільм</button></div> : (
              <div className="divide-y divide-white/[0.06]">
                {movies.map((movie) => <article key={movie.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6">
                  <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-[#0d1118]">{movie.posterUrl && <Image src={movie.posterUrl} alt={`Постер фільму «${movie.title}»`} fill unoptimized sizes="64px" className="object-cover" />}</div>
                  <div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-white">{movie.title || "Фільм без назви"}</h3><p className="mt-1 line-clamp-1 text-xs text-slate-400">{movie.genres || "Жанри не вказані"}</p><p className="mt-2 text-xs text-slate-500">{movie.duration ? `${movie.duration} хв` : "Тривалість не вказана"}{movie.rating ? ` · ★ ${movie.rating}` : ""}{movie.ageRestriction ? ` · ${movie.ageRestriction}+` : ""}</p></div>
                  <div className="flex shrink-0 gap-2"><button type="button" onClick={() => openEdit(movie)} className="h-10 rounded-lg border border-[#303b4c] px-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05]">Редагувати</button>{userRole === "ADMIN" && <button type="button" onClick={() => { setDeleting(movie); setDeleteError(""); }} className="h-10 rounded-lg border border-rose-500/30 px-4 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10">Видалити</button>}</div>
                </article>)}
              </div>
            )}
          </section>
        </main>
      </div>

      {editor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditor(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="movie-editor-title" className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#303b4c] bg-[#121720] shadow-2xl">
          <header className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4 sm:px-7"><div><h2 id="movie-editor-title" className="text-lg font-bold">{editor.mode === "create" ? "Додати фільм" : "Редагувати фільм"}</h2><p className="mt-1 text-xs text-slate-400">Поля позначені * є обов’язковими.</p></div><button type="button" disabled={saving} onClick={() => setEditor(null)} aria-label="Закрити форму" className="rounded-md px-2 text-xl text-slate-400 hover:text-white disabled:opacity-50">×</button></header>
          <form onSubmit={saveMovie} className="flex min-h-0 flex-1 flex-col">
            <div className="overflow-y-auto px-5 py-5 sm:px-7">
              {formError && <p role="alert" className="mb-5 rounded-lg border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p>}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={`${labelClass} sm:col-span-2`}>Назва фільму *<input required maxLength={160} value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Наприклад, Дюна: Частина друга" className={inputClass} /></label>
                <label className={`${labelClass} sm:col-span-2`}>Опис *<textarea required maxLength={3000} rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Короткий опис сюжету" className="mt-2 w-full rounded-lg border border-[#283241] bg-[#0d1118] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500" /></label>
                <label className={labelClass}>Жанри *<input required value={form.genres} onChange={(event) => updateField("genres", event.target.value)} placeholder="Фантастика, Пригоди, Драма" className={inputClass} /><span className="mt-1.5 block text-xs font-normal text-slate-500">Розділяйте жанри комами.</span></label>
                <label className={labelClass}>Режисер *<input required maxLength={120} value={form.director} onChange={(event) => updateField("director", event.target.value)} placeholder="Дені Вільнев" className={inputClass} /></label>
                <label className={labelClass}>Мова *<input required maxLength={100} value={form.language} onChange={(event) => updateField("language", event.target.value)} placeholder="Український дубляж" className={inputClass} /></label>
                <label className={labelClass}>Вікове обмеження *<input required type="number" min="0" max="21" step="1" value={form.ageRestriction} onChange={(event) => updateField("ageRestriction", event.target.value)} placeholder="16" className={inputClass} /></label>
                <label className={labelClass}>Тривалість, хв *<input required type="number" min="1" max="600" step="1" value={form.duration} onChange={(event) => updateField("duration", event.target.value)} placeholder="166" className={inputClass} /></label>
                <label className={labelClass}>Рейтинг *<input required type="number" min="0" max="10" step="0.1" value={form.rating} onChange={(event) => updateField("rating", event.target.value)} placeholder="8.6" className={inputClass} /></label>
                <label className={`${labelClass} sm:col-span-2`}>Посилання на постер *<input required type="url" maxLength={1000} value={form.posterUrl} onChange={(event) => updateField("posterUrl", event.target.value)} placeholder="https://…" className={inputClass} /></label>
                <label className={`${labelClass} sm:col-span-2`}>Посилання на трейлер *<input required type="url" maxLength={1000} value={form.trailerUrl} onChange={(event) => updateField("trailerUrl", event.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={inputClass} /></label>
              </div>
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:justify-end sm:px-7"><button type="button" disabled={saving} onClick={() => setEditor(null)} className="h-11 rounded-lg border border-[#283241] px-5 text-sm font-medium text-slate-300 hover:bg-white/[0.04] disabled:opacity-50">Скасувати</button><button type="submit" disabled={saving} className="h-11 rounded-lg bg-[#e3262d] px-6 text-sm font-semibold text-white transition hover:bg-[#f13a41] disabled:cursor-wait disabled:opacity-60">{saving ? "Зберігаємо…" : editor.mode === "create" ? "Додати фільм" : "Зберегти зміни"}</button></footer>
          </form>
        </section>
      </div>}

      {deleting && <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingNow) setDeleting(null); }}>
        <section role="alertdialog" aria-modal="true" aria-labelledby="delete-movie-title" className="w-full max-w-lg rounded-xl border border-[#303b4c] bg-[#121720] p-6 shadow-2xl sm:p-7">
          <h2 id="delete-movie-title" className="text-xl font-bold">Видалити фільм?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Буде видалено фільм «{deleting.title}». Якщо з ним пов’язані сеанси або квитки, сервер може відхилити видалення.</p>
          {deleteError && <p role="alert" className="mt-4 rounded-lg border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{deleteError}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={deletingNow} onClick={() => setDeleting(null)} className="h-11 rounded-lg border border-[#303b4c] px-5 text-sm font-medium text-slate-300 hover:bg-white/[0.04] disabled:opacity-50">Скасувати</button><button type="button" disabled={deletingNow} onClick={() => void deleteMovie()} className="h-11 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">{deletingNow ? "Видаляємо…" : "Так, видалити"}</button></div>
        </section>
      </div>}
    </div>
  );
}
