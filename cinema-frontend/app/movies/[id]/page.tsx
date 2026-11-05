"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params.id; // Отримуємо id фільму з URL

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="container mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Постер фільму */}
          <div className="w-full md:w-1/3">
            <img 
              src={movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600"} 
              alt={movie.title}
              className="w-full rounded-lg shadow-lg object-cover" 
            />
          </div>

          {/* Деталі фільму */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <p className="text-gray-400 text-sm mb-4">Жанри: {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres}</p>
            <p className="text-gray-300 mb-6 leading-relaxed">{movie.description}</p>
            
            <div className="flex gap-6 text-sm text-gray-300 mb-6">
              <div>⭐ Рейтинг: <span className="font-bold text-white">{movie.rating}</span></div>
              <div>⏱️ Тривалість: <span className="font-bold text-white">{movie.duration} хв</span></div>
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition">
              Обрати сеанс та місце
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}