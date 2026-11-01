"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function MovieDetail() {
  // Стани для вибору дати та часу
  const [selectedDate, setSelectedDate] = useState("ПН 14");
  const [selectedTime, setSelectedTime] = useState("17:15");

  const dates = [
    { day: "ПН", date: "14" },
    { day: "ВТ", date: "15" },
    { day: "СР", date: "16" },
    { day: "ЧТ", date: "17" },
    { day: "ПТ", date: "18" },
  ];

  const times = [
    { time: "14:30", price: "150 грн" },
    { time: "17:15", price: "150 грн" },
    { time: "20:00", price: "150 грн" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">

        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>КіноКлік</span> &gt; <span>Фільми</span> &gt; <span className="text-white font-medium">Кузьма: Страшно веселий</span>
        </div>

        {/* Блок з інформацією про фільм */}
        <div className="bg-[#121621] border border-gray-800/80 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Постер та трейлер */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden relative bg-gray-900 border border-gray-800">
              <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-xs px-2.5 py-1 rounded-md font-semibold z-10">
                12+
              </span>
              <img 
                src="/images/kuzma.webp" 
                alt="Кузьма: Страшно веселий" 
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

          {/* Детальна інформація */}
          <div className="md:col-span-8 space-y-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Кузьма: Страшно веселий
            </h1>

            {/* Характеристики (таблиця) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm border-t border-b border-gray-800/80 py-4">
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Вікові обмеження</span>
                <span className="font-medium text-white">12+</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Рік</span>
                <span className="font-medium text-white">2026</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Режисер</span>
                <span className="font-medium text-white">Артем Григорян</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Мова</span>
                <span className="font-medium text-white">українська мова</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Жанр</span>
                <span className="font-medium text-white">Біографічний, Документальний</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Тривалість</span>
                <span className="font-medium text-white">2год 13хв</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-12">
                <span className="text-gray-400">Виробництво</span>
                <span className="font-medium text-white">Україна</span>
              </div>
            </div>

            {/* Опис */}
            <div className="space-y-2 text-sm text-gray-300/90 leading-relaxed">
              <p>
                Біографічний документальний фільм «Кузьма: Страшно веселий» розповідає про Андрія Кузьменка, лідера гурту «Скрябін», і показує його життєвий шлях через архівні матеріали, особисті історії та відверті спогади.
              </p>
              <p className="text-gray-400 text-xs">
                Стрічка розкриває людину за яскравим сценічним образом — з її самоіронією, внутрішніми змінами та життям на повній швидкості, яке й досі надихає мільйони шанувальників.
              </p>
            </div>
          </div>
        </div>

        {/* Блок вибору дати та часу сеансів */}
        <div className="bg-[#121621] border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6">
          {/* Вибір дати */}
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

          {/* Вибір часу */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Виберіть час</h3>
            <div className="flex flex-wrap gap-3">
              {times.map((item, idx) => {
                const isSelected = selectedTime === item.time;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedTime(item.time)}
                    className={`px-6 py-3 rounded-xl font-medium text-sm transition border ${
                      isSelected 
                        ? "bg-[#181f2d] text-white border-red-600 ring-1 ring-red-600" 
                        : "bg-[#181f2d] text-gray-300 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {item.time} | від {item.price}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Кнопка бронювання */}
          <div className="pt-4">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-600/30 text-center text-base">
              Забронювати
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}