"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { API_URL } from "@/app/api";

type Ticket = {
  id: string;
  qrCode?: string;
  qrCodeImage?: string;
  status?: string;
  price?: number;
  row?: number;
  seatNumber?: number;
  seat?: { row?: number; number?: number };
  movie?: { title?: string; posterUrl?: string };
  session?: { startTime?: string; hall?: { name?: string }; movie?: { title?: string; posterUrl?: string } };
  order?: { totalAmount?: number; status?: string; session?: Ticket["session"] };
};

function extractTickets(payload: unknown): Ticket[] {
  if (Array.isArray(payload)) return payload as Ticket[];
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  const collection = [data.tickets, data.orders, data.items, data.data].find(Array.isArray) as unknown[] | undefined;
  if (!collection) return [];
  return collection.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (Array.isArray(record.tickets)) {
      return (record.tickets as Ticket[]).map((ticket) => ({ ...ticket, order: (ticket.order || record) as Ticket["order"] }));
    }
    return [record as Ticket];
  });
}

function dateTime(value?: string) {
  if (!value) return "Час сеансу не вказано";
  const date = new Date(value);
  return date.toLocaleString("uk-UA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Kyiv" });
}

function hasPassed(ticket: Ticket) {
  const status = `${ticket.status || ticket.order?.status || ""}`.toLowerCase();
  const start = ticket.session?.startTime || ticket.order?.session?.startTime;
  return ["used", "used_up", "expired", "completed", "використано"].some((value) => status.includes(value)) || Boolean(start && new Date(start).getTime() < Date.now());
}

function getQrImageSource(value: string) {
  if (value.startsWith("data:image/") || value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
  return `data:image/png;base64,${value}`;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [downloadedQr, setDownloadedQr] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("kinoklik-token");
    setHasSession(Boolean(token));
    if (!token) {
      setTickets([]);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/tickets/my`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("kinoklik-token");
        localStorage.removeItem("kinoklik-user");
        setHasSession(false);
        setTickets([]);
        window.dispatchEvent(new Event("kinoklik-auth-change"));
        return;
      }
      if (!response.ok) {
        const message = Array.isArray(payload.message) ? payload.message.join(" ") : payload.message;
        throw new Error(message || "Не вдалося завантажити квитки.");
      }
      setTickets(extractTickets(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося завантажити квитки.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    setDownloadedQr("");
    setQrError("");
    setQrLoading(false);

    if (!selectedTicket || hasPassed(selectedTicket) || selectedTicket.qrCodeImage) return;

    const token = localStorage.getItem("kinoklik-token");
    setQrLoading(true);
    void fetch(`${API_URL}/tickets/${encodeURIComponent(selectedTicket.id)}/qr-code`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem("kinoklik-token");
          localStorage.removeItem("kinoklik-user");
          setHasSession(false);
          window.dispatchEvent(new Event("kinoklik-auth-change"));
          throw new Error("Сеанс входу завершився. Увійдіть знову, щоб переглянути квиток.");
        }
        if (!response.ok) throw new Error("Не вдалося завантажити QR-код цього квитка.");
        const image = await response.blob();
        if (image.type && !image.type.startsWith("image/")) throw new Error("Сервер не повернув зображення QR-коду.");
        const nextObjectUrl = URL.createObjectURL(image);
        if (cancelled) URL.revokeObjectURL(nextObjectUrl);
        else {
          objectUrl = nextObjectUrl;
          setDownloadedQr(nextObjectUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) setQrError(err instanceof Error ? err.message : "Не вдалося завантажити QR-код.");
      })
      .finally(() => { if (!cancelled) setQrLoading(false); });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedTicket]);

  const { activeTickets, pastTickets } = useMemo(() => ({
    activeTickets: tickets.filter((ticket) => !hasPassed(ticket)),
    pastTickets: tickets.filter(hasPassed),
  }), [tickets]);

  const ticketCard = (ticket: Ticket, past = false) => {
    const session = ticket.session || ticket.order?.session;
    const movie = ticket.movie || session?.movie;
    const seat = ticket.seat ? `${ticket.seat.row ?? "—"} ряд · місце ${ticket.seat.number ?? "—"}` : ticket.row != null ? `${ticket.row} ряд · місце ${ticket.seatNumber ?? "—"}` : "Місце у квитку";
    return (
      <article key={ticket.id} className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-[#121720] p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-[#19202c]">
          {movie?.posterUrl && <Image src={movie.posterUrl} alt={movie.title || "Постер фільму"} fill sizes="80px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-white">{movie?.title || "Квиток у кіно"}</h2>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${past ? "bg-slate-700/60 text-slate-300" : "bg-emerald-500/10 text-emerald-300"}`}>{past ? "Використано" : "Оплачено"}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{dateTime(session?.startTime)}{session?.hall?.name ? ` · ${session.hall.name}` : " · Коломия"}</p>
          <p className="mt-2 text-sm text-slate-200">{seat}{ticket.price ? ` · ${ticket.price} грн` : ""}</p>
          <p className="mt-2 truncate text-[11px] text-slate-500">№ {ticket.id}</p>
        </div>
        <button type="button" onClick={() => setSelectedTicket(ticket)} className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-bold transition ${past ? "bg-[#19202c] text-slate-200 hover:bg-[#222b39]" : "bg-[#e3262d] text-white hover:bg-[#f13a41]"}`}>
          {past ? "Переглянути" : "Показати QR-квиток"}
        </button>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1016] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8">
        <h1 className="text-2xl font-bold">Мої квитки</h1>
        <p className="mt-2 text-sm text-slate-400">Найближчі сеанси та історія відвідувань.</p>

        {loading ? (
          <section aria-label="Завантаження квитків" className="mt-8 space-y-4">
            {[0, 1].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl border border-white/[0.05] bg-[#121720]" />)}
          </section>
        ) : error ? (
          <section role="alert" className="mt-8 rounded-xl border border-white/[0.07] bg-[#121720] p-8">
            <h2 className="text-lg font-bold">Не вдалося завантажити квитки</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">Перевірте з’єднання та спробуйте ще раз. Ваші дані акаунта не втрачено.</p>
            <button type="button" onClick={() => void loadTickets()} className="mt-5 rounded-lg bg-[#e3262d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#f13a41]">Спробувати знову</button>
          </section>
        ) : !hasSession ? (
          <section className="mt-8 rounded-xl border border-white/[0.07] bg-[#121720] p-8">
            <h2 className="text-lg font-bold">Увійдіть, щоб побачити квитки</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">Оплачені квитки зберігаються у вашому акаунті.</p>
            <Link href="/login" className="mt-5 inline-block rounded-lg bg-[#e3262d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#f13a41]">Увійти</Link>
          </section>
        ) : tickets.length === 0 ? (
          <section className="mt-8 rounded-xl border border-white/[0.07] bg-[#121720] p-8">
            <h2 className="text-lg font-bold">Квитків поки немає</h2>
            <p className="mt-2 text-sm text-slate-400">Оберіть фільм і сеанс. Після успішної оплати квитки з’являться тут.</p>
            <Link href="/" className="mt-5 inline-block rounded-lg bg-[#e3262d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#f13a41]">Обрати фільм</Link>
          </section>
        ) : (
          <div className="mt-8 space-y-8">
            <section>
              <h2 className="mb-4 text-lg font-bold">Активні квитки · {activeTickets.length} замовлення</h2>
              {activeTickets.length ? <div className="space-y-3">{activeTickets.map((ticket) => ticketCard(ticket))}</div> : <p className="rounded-xl border border-white/[0.06] bg-[#121720] p-5 text-sm text-slate-400">Немає майбутніх сеансів.</p>}
            </section>
            <section>
              <h2 className="mb-4 text-lg font-bold">Минулі квитки · {pastTickets.length} замовлення</h2>
              {pastTickets.length ? <div className="space-y-3">{pastTickets.map((ticket) => ticketCard(ticket, true))}</div> : <p className="rounded-xl border border-white/[0.06] bg-[#121720] p-5 text-sm text-slate-400">Історія відвідувань поки порожня.</p>}
            </section>
          </div>
        )}
      </main>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTicket(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="ticket-title" className="w-full max-w-[480px] rounded-xl border border-white/[0.08] bg-[#121720] p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ваш електронний квиток</p>
            <h2 id="ticket-title" className="mt-2 text-xl font-bold">{selectedTicket.movie?.title || selectedTicket.session?.movie?.title || "Квиток у кіно"}</h2>
            <p className="mt-2 text-sm text-slate-400">{dateTime(selectedTicket.session?.startTime || selectedTicket.order?.session?.startTime)}</p>
            {hasPassed(selectedTicket) ? (
              <div className="mt-6 rounded-lg bg-[#19202c] p-4"><h3 className="font-semibold">Квиток використано</h3><p className="mt-1 text-sm text-slate-400">QR-код більше не дійсний.</p></div>
            ) : selectedTicket.qrCodeImage || downloadedQr ? (
              <div className="mx-auto mt-6 h-56 w-56 rounded-xl bg-white p-3"><Image src={getQrImageSource(selectedTicket.qrCodeImage || downloadedQr)} alt="QR-код квитка" width={224} height={224} unoptimized className="h-full w-full object-contain" /></div>
            ) : selectedTicket.qrCode ? (
              <div className="mt-6 rounded-lg bg-[#19202c] p-4 text-center text-sm text-slate-300">
                {qrLoading ? "Завантажуємо QR-код…" : qrError || "QR-код недоступний. Код квитка:"}
                <p className="mt-2 break-all text-xs text-slate-400">{selectedTicket.qrCode}</p>
              </div>
            ) : (
              <p className="mt-6 rounded-lg bg-[#19202c] p-4 text-sm text-slate-400">{qrLoading ? "Завантажуємо QR-код…" : qrError || "QR-код для цього квитка недоступний."}</p>
            )}
            <p className="mt-4 text-center text-xs text-slate-500">№ {selectedTicket.id}</p>
            <button type="button" onClick={() => setSelectedTicket(null)} className="mt-5 w-full rounded-lg bg-[#19202c] px-4 py-3 text-sm font-semibold text-white hover:bg-[#222b39]">Закрити</button>
          </section>
        </div>
      )}
    </div>
  );
}
