type DateFilterProps = {
  dates: Array<{ key: string; day: string; label: string }>;
  selectedDate: string;
  onSelect: (date: string) => void;
};

export default function DateFilter({ dates, selectedDate, onSelect }: DateFilterProps) {
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
