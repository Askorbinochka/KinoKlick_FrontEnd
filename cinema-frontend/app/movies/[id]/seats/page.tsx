"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function SeatSelection() {
  const params = useParams();
  const movieId = params.id;

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const ticketPrice = 150; // Ціна за квиток

  // Функція кліку на місце
  const toggleSeat = (row: number, seat: number) => {
    const seatId = `${row}-${seat}`;
    if (selectedSeats.includes(seatId)) {
      // Якщо вже вибрано — видаляємо
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      // Якщо ні — додаємо до обраних
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
     
        <div className="flex items-center gap-4">
          <Link href={`/movies/${movieId}`} className="bg-gray-800 p-2 rounded-xl hover:bg-gray-700 transition">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">Кузьма: Страшно веселий</h1>
            <p className="text-xs text-gray-400">Сьогодні, 14:30 • Зал 1</p>
          </div>
        </div>

        {/* Екран кінотеатру */}
        <div className="flex flex-col items-center justify-center space-y-4 py-6 bg-[#121621] rounded-3xl border border-gray-800">
          <div className="w-3/4 h-3 bg-red-600/60 rounded-full blur-sm shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
          <span className="text-xs text-gray-400 tracking-widest uppercase">Екран</span>
        </div>

      
        <div className="bg-[#121621] border border-gray-800 rounded-3xl p-8 flex flex-col items-center gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4 text-center">{row}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((seat) => {
                  const seatId = `${row}-${seat}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const isBusy = (row === 4 && seat === 9) || (row === 4 && seat === 10); // приклад зайнятих

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
              <span className="text-xs text-gray-500 w-4 text-center">{row}</span>
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

        {/* Нижня панель підсумків */}
        <div className="bg-[#121621] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-gray-400">ОБРАНІ МІСЦЯ ({selectedSeats.length})</p>
            <div className="flex gap-2 mt-1">
              {selectedSeats.length > 0 ? (
                selectedSeats.map((s, i) => {
                  const [r, seatNum] = s.split("-");
                  return (
                    <span key={i} className="text-xs bg-[#1b2230] px-3 py-1.5 rounded-lg border border-gray-800 text-white">
                      {r} ряд, {seatNum} місце
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
              <p className="text-xl font-bold text-white">{selectedSeats.length * ticketPrice} грн</p>
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-red-600/30">
              Перейти до оплати →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}