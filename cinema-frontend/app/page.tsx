import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import DateFilter from "@/components/DateFilter";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const movies = [
    { title: "Кузьма: Страшно веселий",
       genre: "Документальний, Музика",
        rating: 9.9, 
        sessions: ["14:30", "17:15", "20:00"],
         price: 150,
          image: "/images/kuzma.webp"},
    { title: "Над безоднею 2",
       genre: "Трилер",
       rating: 7.8, 
       sessions: ["14:00", "17:30", "20:45"], 
       price: 150,
      image: "/images/fall2.webp" },
    { title: "Астрал: За межами Потойбіччя",
       genre: "Жахи, Трилер",
        rating: 8.7, 
        sessions: ["15:00", "18:15", "21:30"],
        price: 170 ,
      image: "/images/astral.webp" },
    { title: "Відважний Давид проти Велетня",
       genre: "Мультфільм, Сімейний",
        rating: 8.0,
         sessions: ["16:30", "18:45", "22:15"], 
         price: 100 ,
        image: "/images/david.jpg"},
  ];

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
          {movies.map((movie, index) => (
            <MovieCard key={index} {...movie} />
          ))}
        </div>
      </main>
    </div>
  );
}