"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function SeatSelectionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const movieId = params.id;

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [busySeats, setBusySeats] = useState<string[]>(["4-9", "4-10"]);

  const selectedDate = searchParams.get("date") || "12";
  const selectedTime = searchParams.get("time") || "17:15";

  useEffect(() => {
    if (!movieId) return;

    fetch(`https://kinoklick-backend.onrender.com/movies/${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження фільму:", err);
        setLoading(false);
      });
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Завантаження схеми залу...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white">
        <Navbar />
        <div className="text-center py-20 text-red-500">Фільм не знайдено</div>
      </div>
    );
  }

  const ticketPrice = movie?.price || 150;

  const handleGoToPayment = () => {
    if (selectedSeats.length === 0) return;
    const total = selectedSeats.length * ticketPrice;

    router.push(
      `/movies/${movieId}/payment?seats=${selectedSeats.join(",")}&total=${total}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
    );
  };

  const toggleSeat = (row: number, seat: number) => {
    const seatId = `${row}-${seat}`;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
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
              {selectedDate} листопада, {selectedTime} • Зал 1
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-6 bg-[#121621] rounded-3xl border border-gray-800">
          <div className="w-3/4 h-3 bg-red-600/60 rounded-full blur-sm shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
          <span className="text-xs text-gray-400 tracking-widest uppercase">
            Екран
          </span>
        </div>

        <div className="bg-[#121621] border border-gray-800 rounded-3xl p-8 flex flex-col items-center gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4 text-center">
                {row}
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((seat) => {
                  const seatId = `${row}-${seat}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const isBusy = busySeats.includes(seatId);

                  return (
                    <button
                      key={seat}
                      disabled={isBusy}
                      onClick={() => toggleSeat(row, seat)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-medium transition ${
                        isBusy
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : isSelected
                          ? "bg-red-600 text-white shadow-lg shadow-red-600/40"
                          : "bg-[#1b2230] text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-gray-500 w-4 text-center">
                {row}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-6 mt-8 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#1b2230]"></span> Вільні
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-600"></span> Вибрані
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-800"></span> Зайняті
            </div>
          </div>
        </div>

        <div className="bg-[#121621] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-gray-400">
              ОБРАНІ МІСЦЯ ({selectedSeats.length})
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {selectedSeats.length > 0 ? (
                selectedSeats.map((s, i) => {
                  const [r, seatNum] = s.split("-");
                  return (
                    <span
                      key={i}
                      className="text-xs bg-[#181f2d] px-3 py-1.5 rounded-lg border border-gray-800 text-white"
                    >
                      {r} ряд, {seatNum} місце
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-gray-500">
                  Місця не вибрано
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-400">Загальна вартість</p>
              <p className="text-xl font-bold text-white">
                {selectedSeats.length * ticketPrice} грн
              </p>
            </div>

            <button
              onClick={handleGoToPayment}
              disabled={selectedSeats.length === 0}
              className={`font-bold px-8 py-3.5 rounded-xl transition shadow-lg ${
                selectedSeats.length > 0
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              Перейти до оплати →
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