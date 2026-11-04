import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import DateFilter from "@/components/DateFilter";
import MovieCard from "@/components/MovieCard";
import { movies } from "./moviesData"; // Виправляємо шлях до твого файлу

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <HeroBanner />
        <DateFilter />

        {/* Секція Зараз у кіно */}
        <div className="flex justify-between items-center my-6">
          <h2 className="text-xl font-bold text-white">Зараз у кіно</h2>
          <button className="text-xs text-red-500 hover:text-red-400 font-semibold">
            Дивитися всі →
          </button>
        </div>

        {/* Сітка фільмів */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      </main>
    </div>
  );
}