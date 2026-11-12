"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { API_URL } from "@/app/api";

function SeatSelectionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const movieId = params.id;
  const sessionId = searchParams.get("sessionId");
  const selectedDate = searchParams.get("date") || "";
  const selectedTime = searchParams.get("time") || "";

  const [movie, setMovie] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  // Завантаження інформації про фільм, сеанс та місця із залу
  useEffect(() => {
    if (!sessionId) {
      setError("Не вдалося визначити сеанс. Поверніться до вибору часу.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/sessions/${sessionId}/seats`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Не вдалося завантажити місця для цього сеансу.");
        return res.json();
      })
      .then((data) => {
        // Згідно зі схемою Swagger, бекенд повертає об'єкт з полями session та seats
        if (data.session) {
          setSession(data.session);
          setMovie(data.session.movie);
        }
        if (data.seats && Array.isArray(data.seats)) {
          setSeats(data.seats);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження схеми залу:", err);
        setError(err instanceof Error ? err.message : "Не вдалося завантажити схему залу.");
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Завантаження схеми залу...</div>
      </div>
    );
  }

  const selectedSeats = seats.filter((seat) => selectedSeatIds.includes(seat.id));
  const totalPrice = selectedSeats.reduce((total, seat) => total + (Number(seat.price) || 0), 0);

  // Вибір/скасування вибору місця за його унікальним ID
  const toggleSeat = (seat: any) => {
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
      const bookRes = await fetch(`${API_URL}/tickets/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      setBooking(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/movies/${movieId}`}
            className="bg-gray-800 p-2 rounded-xl hover:bg-gray-700 transition"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">{movie?.title}</h1>
            <p className="text-xs text-gray-400">
              {selectedDate}, {selectedTime} • {session?.hall?.name || "Зал 1"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-6 bg-[#121621] rounded-3xl border border-gray-800">
          <div className="w-3/4 h-3 bg-red-600/60 rounded-full blur-sm shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
          <span className="text-xs text-gray-400 tracking-widest uppercase">Екран</span>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Рендеринг місць на основі даних від бекенда */}
        <div className="bg-[#121621] border border-gray-800 rounded-3xl p-8 flex flex-col items-center gap-3">
          {Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b).map((rowNum) => (
            <div key={rowNum} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4 text-center">{rowNum}</span>
              <div className="flex gap-1.5">
                {seats
                  .filter((s) => s.row === rowNum)
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isAvailable = seat.status === "AVAILABLE";

                    let bgClass = "bg-[#1b2230] text-gray-400 hover:bg-gray-700";
                    if (!isAvailable) {
                      bgClass = "bg-gray-800 text-gray-600 cursor-not-allowed";
                    } else if (isSelected) {
                      bgClass = "bg-red-600 text-white shadow-lg shadow-red-600/40";
                    } else if (seat.type === "VIP") {
                      bgClass = "bg-amber-500/20 text-amber-300 border border-amber-500/40";
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={!isAvailable}
                        onClick={() => toggleSeat(seat)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-medium transition ${bgClass}`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
              </div>
              <span className="text-xs text-gray-500 w-4 text-center">{rowNum}</span>
            </div>
          ))}

          <div className="flex items-center gap-6 mt-8 text-xs text-gray-400">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#1b2230]"></span> Вільні</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-600"></span> Вибрані</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-800"></span> Зайняті/Куплені</div>
          </div>
        </div>

        <div className="bg-[#121621] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-gray-400">ОБРАНІ МІСЦЯ ({selectedSeatIds.length})</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {selectedSeatIds.length > 0 ? (
                selectedSeatIds.map((id) => {
                  const seatObj = seats.find((s) => s.id === id);
                  return (
                    <span key={id} className="text-xs bg-[#181f2d] px-3 py-1.5 rounded-lg border border-gray-800 text-white">
                      {seatObj ? `${seatObj.row} ряд, ${seatObj.number} місце` : "Місце"}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-gray-500">Місця не вибрано</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-400">Загальна вартість</p>
              <p className="text-xl font-bold text-white">{totalPrice} грн</p>
            </div>

            <button
              onClick={handleGoToPayment}
              disabled={selectedSeatIds.length === 0 || booking}
              className={`font-bold px-8 py-3.5 rounded-xl transition shadow-lg ${
                selectedSeatIds.length > 0 && !booking
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              {booking ? "Створюємо бронювання…" : "Продовжити →"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SeatSelection() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0e14] text-white text-center py-20">Завантаження...</div>}>
      <SeatSelectionContent />
    </Suspense>
  );
}
