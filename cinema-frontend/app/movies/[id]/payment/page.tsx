"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { movies } from "../../../moviesData";

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Отримуємо ID фільму з URL
  const movieId = Number(params.id);
  const movie = movies.find((m) => m.id === movieId) || movies[0];

  // Зчитуємо динамічні параметри з посилання (місця, суму, дату та час)
  const seatsParam = searchParams.get("seats") || "";
  const totalParam = searchParams.get("total") || String(movie.price);
  const selectedDate = searchParams.get("date") || "14 вересня";
  const selectedTime = searchParams.get("time") || "18:15";

  const totalPrice = Number(totalParam);
  const seatsList = seatsParam ? seatsParam.split(",") : [];
  const ticketCount = seatsList.length > 0 ? seatsList.length : 1;
  const ticketPrice = movie.price;

  // Форматуємо місця для красивого виведення
  const formattedSeats = seatsList.length > 0 
    ? seatsList.map(s => {
        const [row, seat] = s.split("-");
        return `${row} ряд, ${seat} місце`;
      }).join(", ")
    : "Місця не вибрано";

  const [isPaid, setIsPaid] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaid(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {!isPaid ? (
          /* ЕТАП 1: Форма оплати */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 bg-[#121621] border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Оформлення замовлення</h1>
                <p className="text-xs text-gray-400 mt-1">Будь ласка, вкажіть реквізити для оплати та завершення бронювання.</p>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Спосіб оплати */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Спосіб оплати</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="py-3 rounded-xl border border-gray-800 bg-[#181f2d] text-sm font-medium hover:border-gray-600 transition">
                      Apple Pay
                    </button>
                    <button type="button" className="py-3 rounded-xl border border-red-600 bg-[#181f2d] text-sm font-medium text-white shadow-lg shadow-red-600/20">
                      Картка
                    </button>
                    <button type="button" className="py-3 rounded-xl border border-gray-800 bg-[#181f2d] text-sm font-medium hover:border-gray-600 transition">
                      Google Pay
                    </button>
                  </div>
                </div>

                {/* Поля картки */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ІМ'Я ВЛАСНИКА КАРТКИ</label>
                    <input 
                      type="text" 
                      placeholder="наприклад, Андрій Соповський" 
                      required
                      className="w-full bg-[#181f2d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">НОМЕР КАРТКИ</label>
                    <input 
                      type="text" 
                      placeholder="•••• •••• •••• 4321" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      maxLength={19}
                      className="w-full bg-[#181f2d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">ТЕРМІН ДІЇ</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        maxLength={5}
                        className="w-full bg-[#181f2d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">CVV</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        maxLength={4}
                        className="w-full bg-[#181f2d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Контактні дані */}
                <div className="space-y-4 pt-2 border-t border-gray-800">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Контактні дані</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">EMAIL</label>
                      <input 
                        type="email" 
                        placeholder="andrii.sopovskli@gmail.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#181f2d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">НОМЕР ТЕЛЕФОНУ</label>
                      <input 
                        type="tel" 
                        placeholder="+380 (555) 987-65-43" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-[#181f2d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-600/30 text-center text-base cursor-pointer"
                >
                  СПЛАТИТИ • {totalPrice} ГРН
                </button>
              </form>
            </div>

            {/* Права колонка: Динамічний чек замовлення */}
            <div className="lg:col-span-5">
              <div className="bg-[#121621] border border-gray-800 rounded-3xl p-6 space-y-6 sticky top-6">
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
                  <img 
                    src={movie.image} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{movie.title}</h2>
                  {/* ТУТ ТЕПЕР ПІДТЯГУЄТЬСЯ ДИНАМІЧНА ДАТА І ЧАС */}
                  <p className="text-xs text-red-500 font-medium mt-1">
                    Зал 3 • {selectedDate} {selectedTime} • {formattedSeats}
                  </p>
                </div>

                <div className="border-t border-b border-gray-800 py-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Квитки ({ticketCount}x {ticketPrice} грн)</span>
                    <span className="text-white">{totalPrice} грн</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Разом до сплати</span>
                  <span className="text-red-500 text-2xl">{totalPrice} грн</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ЕТАП 2: Успішна оплата та електронний квиток */
          <div className="max-w-xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 text-green-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h1 className="text-2xl font-bold">Оплата пройшла успішно!</h1>
              <p className="text-xs text-gray-400">Ваше бронювання підтверджено. Електронний квиток надіслано на вашу пошту.</p>
            </div>

            <div className="bg-[#121621] border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                <div>
                  <span className="text-xs font-bold tracking-widest text-red-500 uppercase">КіноКлік</span>
                  <h2 className="text-2xl font-extrabold mt-1">{movie.title}</h2>
                  <p className="text-xs text-gray-400">Зал 3</p>
                </div>
                <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-md font-semibold">
                  IMAX 3D
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">ДАТА</p>
                  <p className="font-semibold mt-0.5">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ЧАС</p>
                  <p className="font-semibold mt-0.5">{selectedTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">МІСЦЯ</p>
                  <p className="font-semibold text-red-400 mt-0.5">{formattedSeats}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ТАРИФ</p>
                  <p className="font-semibold mt-0.5">Дорослий ({ticketCount} шт)</p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-800 pt-6 flex flex-col items-center justify-center space-y-3">
                <div className="bg-white p-4 rounded-2xl">
                  <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-xs text-center font-mono rounded">
                    [QR CODE]
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center tracking-wide">СКАНУЙТЕ ПРИ ВХОДІ до ЗАЛИ</p>
                <p className="text-[10px] text-gray-600 font-mono">РЕФ: KKL-20261014-0938</p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/">
                <button className="bg-[#181f2d] hover:bg-gray-800 text-white font-medium px-8 py-3.5 rounded-xl transition border border-gray-800 text-sm cursor-pointer">
                  ← Повернутися на головну
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}