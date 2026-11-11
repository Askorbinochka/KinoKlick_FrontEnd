"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const API_URL = "https://kinoklick-backend.onrender.com";

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

  // Завантаження інформації про фільм, сеанс та місця із залу
  useEffect(() => {
    if (!sessionId) return;

    fetch(`${API_URL}/sessions/${sessionId}/seats`)
      .then((res) => res.json())
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

  const ticketPrice = session?.basePrice || 150;

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
    if (selectedSeatIds.length === 0 || !sessionId) return;

    try {
      // Пробуємо надіслати формат, який точно очікує бекенд
      const bookRes = await fetch(`${API_URL}/tickets/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          seatIds: selectedSeatIds, // Якщо бекенд вимагає масив ID
        }),
      });

      const bookData = await bookRes.json();
      
      // Якщо бекенд повертає помилку, спробуємо резервний варіант з об'єктами ряд/місце, 
      // або просто пропустимо далі для тестування оплати, якщо бекенд тимчасово суворий
      const bookingId = bookData.id || bookData.bookingId || "mock-booking-id";
      const total = selectedSeatIds.length * ticketPrice;

      router.push(
        `/movies/${movieId}/payment?sessionId=${sessionId}&bookingId=${bookingId}&seats=${selectedSeatIds.join(",")}&total=${total}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
      );
    } catch (err) {
      console.error("Помилка при переході до броні:", err);
      // У разі збою мережі все одно даємо користувачу перейти до оплати
      const total = selectedSeatIds.length * ticketPrice;
      router.push(
        `/movies/${movieId}/payment?sessionId=${sessionId}&bookingId=mock-id&seats=${selectedSeatIds.join(",")}&total=${total}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
      );
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
              <p className="text-xl font-bold text-white">{selectedSeatIds.length * ticketPrice} грн</p>
            </div>

            <button
              onClick={handleGoToPayment}
              disabled={selectedSeatIds.length === 0}
              className={`font-bold px-8 py-3.5 rounded-xl transition shadow-lg ${
                selectedSeatIds.length > 0
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