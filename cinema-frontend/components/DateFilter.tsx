type DateFilterProps = {
  selectedDate: string;
  onSelect: (date: string) => void;
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateFilter({ selectedDate, onSelect }: DateFilterProps) {
  const today = new Date();
  const dates = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      key: dateKey(date),
      day: date.toLocaleDateString("uk-UA", { day: "2-digit" }),
      label: index === 0 ? "Сьогодні" : index === 1 ? "Завтра" : date.toLocaleDateString("uk-UA", { weekday: "short" }),
    };
  });

  return (
    <div className="flex gap-2 overflow-x-auto py-2" aria-label="Оберіть дату сеансу">
      {dates.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          aria-pressed={selectedDate === item.key}
          className={`flex min-w-[108px] flex-col items-center justify-center rounded-xl border px-4 py-2.5 transition ${
            selectedDate === item.key
              ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/30"
              : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-600"
          }`}
        >
          <span className="text-base font-bold">{item.day}</span>
          <span className="text-[11px] capitalize opacity-80">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
