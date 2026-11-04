"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { movies } from "@/app/moviesData";

export default function MovieDetail() {
  const params = useParams();
  
  const movieId = Number(params.id) || 0;

  const movie = movies[movieId] || movies[0];

  const [selectedDate, setSelectedDate] = useState("ПН 14");
  const [selectedTime, setSelectedTime] = useState(movie.sessions[0] || "14:30");

  const dates = [
    { day: "ПН", date: "14" },
    { day: "ВТ", date: "15" },
    { day: "СР", date: "16" },
    { day: "ЧТ", date: "17" },
    { day: "ПТ", date: "18" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">

        <div className="text-sm text-gray-400 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition">КіноКлік</Link> &gt; <span>Фільми</span> &gt; <span className="text-white font-medium">{movie.title}</span>
        </div>

        {/* Блок інформації про фільм (динамічний) */}
        <div className="bg-[#121621] border border-gray-800/80 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden relative bg-gray-900 border border-gray-800">
              <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-xs px-2.5 py-1 rounded-md font-semibold z-10">
                {movie.age}
              </span>
              <img 
                src={movie.image} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <button className="flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-white font-medium text-sm py-3 rounded-xl transition bg-black/40 backdrop-blur">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
              <span>Дивитись трейлер</span>
            </button>
          </div>

          <div className="md:col-span-8 space-y-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              {movie.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm border-t border-b border-gray-800/80 py-4">
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Вікові обмеження</span>
                <span className="font-medium text-white">{movie.age}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Рік</span>
                <span className="font-medium text-white">{movie.year}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Режисер</span>
                <span className="font-medium text-white">{movie.director}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Мова</span>
                <span className="font-medium text-white">{movie.language}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Жанр</span>
                <span className="font-medium text-white">{movie.genre}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Тривалість</span>
                <span className="font-medium text-white">{movie.duration}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Виробництво</span>
                <span className="font-medium text-white">{movie.country}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-300/90 leading-relaxed">
              <p>{movie.description}</p>
              <p className="text-gray-400 text-xs">{movie.subDescription}</p>
            </div>
          </div>
        </div>

        {/* Вибір сеансів */}
        <div className="bg-[#121621] border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Виберіть дату</h3>
            <div className="flex flex-wrap gap-3">
              {dates.map((item, idx) => {
                const btnLabel = `${item.day} ${item.date}`;
                const isSelected = selectedDate === btnLabel;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(btnLabel)}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition border ${
                      isSelected 
                        ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/30" 
                        : "bg-[#181f2d] text-gray-300 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {item.day} {item.date}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Виберіть час</h3>
            <div className="flex flex-wrap gap-3">
              {movie.sessions.map((time, idx) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedTime(time)}
                    className={`px-6 py-3 rounded-xl font-medium text-sm transition border ${
                      isSelected 
                        ? "bg-[#181f2d] text-white border-red-600 ring-1 ring-red-600" 
                        : "bg-[#181f2d] text-gray-300 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {time} | від {movie.price} грн
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <Link href={`/movies/${movieId}/seats`}>
             <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-600/30 text-center text-base">
                   Забронювати
             </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}