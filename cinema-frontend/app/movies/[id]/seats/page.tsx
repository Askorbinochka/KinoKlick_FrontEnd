"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { API_URL } from "@/app/api";

type Seat = {
  id: string;
  row: number;
  number: number;
  type: string;
  status: string;
  price: number;
};

type SeatMapResponse = {
  session?: {
    id: string;
    startTime: string;
    basePrice: number;
    movie?: { title?: string };
    hall?: { name?: string };
  };
  seats: Seat[];
};

function SeatSelectionContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const movieId = params.id;
  const sessionId = searchParams.get("sessionId");
  const selectedDate = searchParams.get("date") || "";
  const selectedTime = searchParams.get("time") || "";

  const [seatMap, setSeatMap] = useState<SeatMapResponse | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const loading = Boolean(sessionId) && loadedSessionId !== sessionId;
  const visibleError = !sessionId ? "Не вдалося визначити сеанс. Поверніться до вибору часу." : error;
  const session = seatMap?.session ?? null;
  const movie = session?.movie ?? null;
  const seats = seatMap?.seats ?? [];

  // Завантаження інформації про фільм, сеанс та місця із залу
  useEffect(() => {
    if (!sessionId) return;

    fetch(`${API_URL}/sessions/${sessionId}/seats`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Не вдалося завантажити місця для цього сеансу.");
        return res.json();
      })
      .then((data: SeatMapResponse) => {
        setSeatMap(data);
        setLoadedSessionId(sessionId);
      })
      .catch((err) => {
        console.error("Помилка завантаження схеми залу:", err);
        setError(err instanceof Error ? err.message : "Не вдалося завантажити схему залу.");
        setLoadedSessionId(sessionId);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1016] text-white">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Завантаження схеми залу...</div>
      </div>
    );
  }

  const selectedSeats = seats.filter((seat) => selectedSeatIds.includes(seat.id));
  const totalPrice = selectedSeats.reduce((total, seat) => total + (Number(seat.price) || 0), 0);

  // Вибір/скасування вибору місця за його унікальним ID
  const toggleSeat = (seat: Seat) => {
    if (seat.status !== "AVAILABLE") return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const handleGoToPayment = async () => {
    if (selectedSeatIds.length === 0 || !sessionId || booking) return;

    setBooking(true);
    setError("");
    try {
      const token = localStorage.getItem("kinoklik-token");
      const bookRes = await fetch(`${API_URL}/tickets/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId,
          seatIds: selectedSeatIds,
        }),
      });

      const bookData = await bookRes.json().catch(() => ({}));
      if (!bookRes.ok) {
        throw new Error(bookData.message || "Не вдалося забронювати місця. Оновіть карту залу та спробуйте ще раз.");
      }
      if (!bookData.id) throw new Error("Бекенд не повернув номер бронювання.");

      const seatLabels = selectedSeats.map((seat) => `${seat.row}-${seat.number}`).join(",");

      router.push(
        `/movies/${movieId}/payment?sessionId=${sessionId}&bookingId=${encodeURIComponent(bookData.id)}&seats=${encodeURIComponent(seatLabels)}&total=${totalPrice}&expiresAt=${encodeURIComponent(bookData.expiresAt || "")}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
      );
    } catch (err) {
      console.error("Помилка при переході до броні:", err);
      setError(err instanceof Error ? err.message : "Не вдалося створити бронювання. Спробуйте ще раз.");
      try {
        const refreshed = await fetch(`${API_URL}/sessions/${sessionId}/seats`);
        if (refreshed.ok) {
          const updatedMap = await refreshed.json() as SeatMapResponse;
          setSeatMap(updatedMap);
          setSelectedSeatIds((current) => current.filter((id) => updatedMap.seats.some((seat) => seat.id === id && seat.status === "AVAILABLE")));
        }
      } catch {
        // Keep the original booking error visible if refreshing the seat map also fails.
      }
    } finally {
      setBooking(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0d1016] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] space-y-5 px-5 py-7 sm:px-8">
        <div>
          <Link href={`/movies/${movieId}`} className="text-xs text-slate-400 transition hover:text-white">← Дата та сеанс</Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Оберіть місця</h1>
              <p className="mt-2 text-sm text-slate-400">{movie?.title}</p>
              <p className="mt-1 text-xs text-slate-500">{selectedDate} · {selectedTime} · {session?.hall?.name || "Зал 1"} · 2D · українською</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500"><span>01 Сеанс</span><span>→</span><span className="font-semibold text-white">02 Місця</span><span>→</span><span>03 Оплата</span></div>
          </div>
        </div>

        {visibleError && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{visibleError}</p>}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 rounded-xl border border-white/[0.07] bg-[#121720] p-4 sm:p-7" aria-label="Схема залу">
            <div className="mb-8 flex flex-col items-center gap-2">
              <div className="h-1.5 w-[78%] rounded-[50%] bg-gradient-to-r from-transparent via-slate-200/70 to-transparent shadow-[0_5px_18px_rgba(226,38,45,0.32)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Екран</span>
            </div>

            {seats.length ? (
              <div className="overflow-x-auto pb-2">
                <div className="mx-auto flex w-max min-w-full flex-col items-center gap-2.5">
                  {Array.from(new Set(seats.map((seat) => seat.row))).sort((a, b) => a - b).map((rowNum) => (
                    <div key={rowNum} className="flex items-center gap-2">
                      <span className="w-5 text-center text-[10px] text-slate-500">{rowNum}</span>
                      <div className="flex gap-1.5">
                        {seats.filter((seat) => seat.row === rowNum).sort((a, b) => a.number - b.number).map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isAvailable = seat.status === "AVAILABLE";
                          const bgClass = !isAvailable
                            ? "cursor-not-allowed border-transparent bg-[#080b10] text-slate-700"
                            : isSelected
                              ? "border-[#e3262d] bg-[#e3262d] text-white shadow-[0_0_12px_rgba(227,38,45,0.3)]"
                              : seat.type === "VIP"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                : "border-slate-600 bg-[#19202c] text-slate-200 hover:border-slate-300 hover:bg-[#222b39]";
                          return (
                            <button key={seat.id} type="button" disabled={!isAvailable} onClick={() => toggleSeat(seat)} aria-pressed={isSelected} aria-label={`Ряд ${seat.row}, місце ${seat.number}${isSelected ? ", вибране" : isAvailable ? ", вільне" : ", зайняте"}`} className={`h-8 w-8 rounded-md border text-[10px] font-medium transition ${bgClass}`}>
                              {isAvailable ? seat.number : "×"}
                            </button>
                          );
                        })}
                      </div>
                      <span className="w-5 text-center text-[10px] text-slate-500">{rowNum}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-[#0d1016] p-8 text-center text-sm text-slate-400">Місць для цього сеансу не знайдено.</div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-2"><span className="h-4 w-4 rounded border border-slate-600 bg-[#19202c]" />Вільні · {seats.filter((seat) => seat.status === "AVAILABLE").length}</span>
              <span className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-[#e3262d]" />Вибрані</span>
              <span className="flex items-center gap-2"><span className="grid h-4 w-4 place-items-center rounded bg-[#080b10] text-slate-600">×</span>Зайняті</span>
            </div>
          </section>

          <aside className="rounded-xl border border-white/[0.07] bg-[#121720] p-5 lg:sticky lg:top-16">
            <h2 className="text-base font-bold">Ваш вибір</h2>
            <p className="mt-2 text-xs text-slate-400">{movie?.title}</p>
            <p className="mt-1 text-xs text-slate-500">{selectedDate} · {selectedTime}</p>
            <p className="mt-1 text-xs text-slate-500">{session?.hall?.name || "Зал 1"} · 2D</p>
            <div className="my-4 border-t border-white/[0.07]" />
            <p className="text-xs font-semibold text-slate-300">Ваші місця — за вами.</p>
            <p className="mt-1 text-xs text-slate-500">Ряд · номер місця</p>
            <div className="mt-3 min-h-16 space-y-2">
              {selectedSeats.length ? selectedSeats.map((seat) => (
                <div key={seat.id} className="flex justify-between gap-3 text-xs text-slate-300"><span>Ряд {seat.row} · місце {seat.number}</span><span>{seat.price} грн</span></div>
              )) : <p className="text-xs text-slate-500">Оберіть місця на схемі залу.</p>}
            </div>
            <div className="my-4 border-t border-white/[0.07]" />
            <div className="flex items-end justify-between"><span className="text-xs text-slate-400">{selectedSeatIds.length} квитки</span><span className="text-xl font-bold">{totalPrice} грн</span></div>
            <p className="mt-3 text-[10px] leading-4 text-slate-500">Після продовження місця утримуватимуться 15 хвилин.</p>
            <button type="button" onClick={handleGoToPayment} disabled={selectedSeatIds.length === 0 || booking} className="mt-5 w-full rounded-lg bg-[#e3262d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f13a41] disabled:cursor-not-allowed disabled:bg-[#252b36] disabled:text-slate-500">
              {booking ? "Бронюємо місця…" : "До оформлення"}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function SeatSelection() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1016] text-white text-center py-20">Завантаження...</div>}>
      <SeatSelectionContent />
    </Suspense>
  );
}
