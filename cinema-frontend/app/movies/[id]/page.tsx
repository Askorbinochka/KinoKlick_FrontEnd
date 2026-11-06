"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params.id;

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("12");
  const [selectedTime, setSelectedTime] = useState("17:15");

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
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Завантаження інформації про фільм...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Navbar />
        <div className="text-center py-20 text-red-500">Фільм не знайдено</div>
      </div>
    );
  }

  const genresText = Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="container mx-auto px-8 py-8 space-y-8">
      
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition">КіноКлік</Link>
          <span>›</span>
          <Link href="/" className="hover:text-white transition">Фільми</Link>
          <span>›</span>
          <span className="text-white">{movie.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Постер та кнопка трейлера */}
          <div className="w-full md:w-1/3 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              {movie.ageRestriction && movie.ageRestriction !== 0 && (
                <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-semibold border border-gray-700">
                  {movie.ageRestriction}
                </span>
              )}
              <img 
                src={movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600"} 
                alt={movie.title}
                className="w-full h-auto object-cover" 
              />
            </div>
            
            <button className="w-full bg-[#161b22] hover:bg-[#1f242d] text-gray-200 border border-gray-700/80 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Дивитись трейлер</span>
            </button>
          </div>

          {/* Інформація про фільм */}
          <div className="w-full md:w-2/3 space-y-6">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{movie.title}</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 text-sm border-y border-gray-800 py-5">
              {movie.ageRestriction && movie.ageRestriction !== 0 && (
                <div className="flex justify-between sm:justify-start sm:gap-16">
                  <span className="text-gray-400">Вікові обмеження</span>
                  <span className="text-white font-medium">{movie.ageRestriction}</span>
                </div>
              )}
              {movie.year && movie.year !== 0 && (
                <div className="flex justify-between sm:justify-start sm:gap-16">
                  <span className="text-gray-400">Рік</span>
                  <span className="text-white font-medium">{movie.year}</span>
                </div>
              )}
              {movie.director && movie.director !== "" && (
                <div className="flex justify-between sm:justify-start sm:gap-16">
                  <span className="text-gray-400">Режисер</span>
                  <span className="text-white font-medium">{movie.director}</span>
                </div>
              )}
              {movie.language && movie.language !== "" && (
                <div className="flex justify-between sm:justify-start sm:gap-16">
                  <span className="text-gray-400">Мова</span>
                  <span className="text-white font-medium">{movie.language}</span>
                </div>
              )}
              {genresText && (
                <div className="flex justify-between sm:justify-start sm:gap-16">
                  <span className="text-gray-400">Жанр</span>
                  <span className="text-white font-medium">{genresText}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex justify-between sm:justify-start sm:gap-16">
                  <span className="text-gray-400">Тривалість</span>
                  <span className="text-white font-medium">{movie.duration} хв</span>
                </div>
              )}
              {movie.production && movie.production !== "" && (
                <div className="flex justify-between sm:justify-start sm:gap-16">
                  <span className="text-gray-400">Виробництво</span>
                  <span className="text-white font-medium">{movie.production}</span>
                </div>
              )}
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {movie.description}
            </p>
          </div>
        </div>

        {/* Блок вибору дати та часу */}
        <div className="bg-[#121721] border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400 block">Виберіть дату</label>
            <div className="flex flex-wrap gap-3">
              {[
                { day: "12", label: "Сьогодні, 12 вересня" },
                { day: "13", label: "Завтра, 13 вересня" },
                { day: "14", label: "Пн, 14 вересня" },
                { day: "15", label: "Вт, 15 вересня" },
              ].map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDate(item.day)}
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition border ${
                    selectedDate === item.day
                      ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                      : "bg-[#1a2230] border-gray-700/60 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400 block">Виберіть час</label>
            <div className="flex flex-wrap gap-4">
              {["14:30", "17:15", "20:00"].map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition border flex items-center gap-3 ${
                    selectedTime === time
                      ? "bg-red-600/10 border-red-600 text-white"
                      : "bg-[#1a2230] border-gray-700/60 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <span className="font-bold">{time}</span>
                  <span className="text-xs text-gray-400 border-l border-gray-700 pl-3">від 150 грн</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <Link
              href={`/seats?movieId=${movie.id}&date=${selectedDate}&time=${selectedTime}`}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold transition text-center shadow-lg shadow-red-600/25"
            >
              Забронювати
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}