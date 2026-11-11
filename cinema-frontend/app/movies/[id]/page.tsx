"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const API_URL = "https://kinoklick-backend.onrender.com";

function MovieDetailsContent() {
  const params = useParams();
  const movieId = params.id;

  const [movie, setMovie] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // 1. Завантаження даних про фільм та сеанси
  useEffect(() => {
    if (!movieId) return;

    Promise.all([
      fetch(`${API_URL}/movies/${movieId}`).then((res) => res.json()),
      fetch(`${API_URL}/sessions?movieId=${movieId}`).then((res) => res.json()),
    ])
      .then(([movieData, sessionsData]) => {
        setMovie(movieData);
        
        // Фільтруємо сеанси саме для цього фільму
        const movieSessions = Array.isArray(sessionsData) 
          ? sessionsData.filter((s: any) => s.movieId === movieId || s.movie?.id === movieId)
          : [];
        
        setSessions(movieSessions);

        // Якщо є сеанси, за замовчуванням обираємо перший
        if (movieSessions.length > 0) {
          const first = movieSessions[0];
          setSelectedSessionId(first.id);
          setSelectedDate(new Date(first.startTime).toLocaleDateString("uk-UA", { day: 'numeric', month: 'long' }));
          setSelectedTime(new Date(first.startTime).toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження даних:", err);
        setLoading(false);
      });
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Завантаження інформації...</div>
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

  // Формуємо унікальні дати з startTime
  const availableDates = Array.from(
    new Set(
      sessions.map((s) => 
        new Date(s.startTime).toLocaleDateString("uk-UA", { day: 'numeric', month: 'long' })
      )
    )
  );

  // Доступний час для вибраної дати
  const availableTimes = sessions
    .filter((s) => {
      const dateStr = new Date(s.startTime).toLocaleDateString("uk-UA", { day: 'numeric', month: 'long' });
      return dateStr === selectedDate;
    })
    .map((s) => ({
      sessionId: s.id,
      time: new Date(s.startTime).toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' }),
      price: s.price || 150,
    }));

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="container mx-auto px-8 py-8 space-y-8">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition">КіноКлік</Link>
          <span>›</span>
          <span className="text-white">{movie.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <img 
                src={movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600"} 
                alt={movie.title}
                className="w-full h-auto object-cover" 
              />
            </div>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{movie.title}</h1>
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
              {availableDates.length > 0 ? (
                availableDates.map((dateStr) => (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      // Автоматично обираємо перший час для нової дати
                      const firstForDate = sessions.find(
                        (s) => new Date(s.startTime).toLocaleDateString("uk-UA", { day: 'numeric', month: 'long' }) === dateStr
                      );
                      if (firstForDate) {
                        setSelectedSessionId(firstForDate.id);
                        setSelectedTime(new Date(firstForDate.startTime).toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' }));
                      }
                    }}
                    className={`px-5 py-3 rounded-xl text-sm font-medium transition border ${
                      selectedDate === dateStr
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                        : "bg-[#1a2230] border-gray-700/60 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {dateStr}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">На жаль, на цей фільм наразі немає сеансів</p>
              )}
            </div>
          </div>

          {availableDates.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-400 block">Виберіть час</label>
              <div className="flex flex-wrap gap-4">
                {availableTimes.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedTime(item.time);
                      setSelectedSessionId(item.sessionId);
                    }}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition border flex items-center gap-3 ${
                      selectedTime === item.time
                        ? "bg-red-600/10 border-red-600 text-white"
                        : "bg-[#1a2230] border-gray-700/60 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <span className="font-bold">{item.time}</span>
                    <span className="text-xs text-gray-400 border-l border-gray-700 pl-3">від {item.price} грн</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <Link
              href={`/movies/${movieId}/seats?sessionId=${selectedSessionId}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`}
              className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold transition text-center shadow-lg ${
                selectedDate && selectedTime && selectedSessionId
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25 cursor-pointer" 
                  : "bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none"
              }`}
            >
              Забронювати
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MovieDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117] text-white text-center py-20">Завантаження...</div>}>
      <MovieDetailsContent />
    </Suspense>
  );
}