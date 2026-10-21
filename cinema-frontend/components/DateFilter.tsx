export default function DateFilter() {
  const dates = [
    { day: "12", label: "Сьогодні, 12 вересня", active: true },
    { day: "13", label: "Завтра, 13 вересня", active: false },
    { day: "14", label: "Пн, 14 вересня", active: false },
    { day: "15", label: "Вт, 15 вересня", active: false },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto my-6 pb-2">
      {dates.map((item) => (
        <button
          key={item.day}
          className={`flex flex-col items-center justify-center min-w-[120px] py-3 px-4 rounded-xl border transition ${
            item.active
              ? "bg-red-600 border-red-600 text-white font-semibold"
              : "bg-[#161b22] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
          }`}
        >
          <span className="text-lg font-bold">{item.day}</span>
          <span className="text-xs opacity-80">{item.label}</span>
        </button>
      ))}
    </div>
  );
}