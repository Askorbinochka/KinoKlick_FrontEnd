"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { API_URL } from "@/app/api";

type Ticket = {
  id: string;
  price: number;
  qrCode: string;
  qrCodeImage?: string;
};

type Confirmation = {
  order?: {
    id: string;
    totalAmount: number;
    status: string;
    customerName: string;
  };
  tickets?: Ticket[];
};

function PaymentContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const movieId = params.id;

  const bookingId = searchParams.get("bookingId") || "";
  const sessionId = searchParams.get("sessionId") || "";
  const demoMode = searchParams.get("demo") === "1";
  const seatsParam = searchParams.get("seats") || "";
  const totalPrice = Number(searchParams.get("total") || 0);
  const selectedDate = searchParams.get("date") || "";
  const selectedTime = searchParams.get("time") || "";
  const expiresAt = searchParams.get("expiresAt") || "";
  const seatLabels = seatsParam
    .split(",")
    .filter(Boolean)
    .map((seat) => {
      const [row, number] = seat.split("-");
      return `${row} ряд, ${number} місце`;
    });

  const [movie, setMovie] = useState<{ title?: string; posterUrl?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [demoScenario, setDemoScenario] = useState<"success" | "declined">("success");
  const [showExpiredDemo, setShowExpiredDemo] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [ticketData, setTicketData] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/movies/${movieId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Не вдалося завантажити інформацію про фільм.");
        return res.json();
      })
      .then((data) => setMovie(data))
      .catch((err) => {
        console.error("Помилка завантаження фільму:", err);
        setError(err instanceof Error ? err.message : "Не вдалося завантажити фільм.");
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  useEffect(() => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingId || confirming || secondsLeft === 0 || showExpiredDemo) return;

    if (demoMode && demoScenario === "declined") {
      setError("Демо: платіж відхилено. Бронювання залишається активним до завершення таймера.");
      return;
    }

    setConfirming(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tickets/confirm/${encodeURIComponent(bookingId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, customerEmail, customerPhone }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(" ") : data.message;
        throw new Error(message || "Не вдалося підтвердити бронювання. Перевірте дані та спробуйте ще раз.");
      }

      setTicketData(data);
      setConfirmed(true);
    } catch (err) {
      console.error("Помилка підтвердження бронювання:", err);
      setError(err instanceof Error ? err.message : "Не вдалося підтвердити бронювання.");
    } finally {
      setConfirming(false);
    }
  };

  const isExpired = secondsLeft === 0 || showExpiredDemo;
  const countdownLabel = secondsLeft === null
    ? null
    : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1016] text-white">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Завантаження замовлення...</div>
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-[#0d1016] text-white">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
          <h1 className="text-2xl font-bold">Бронювання не знайдено</h1>
          <p className="text-gray-400">Поверніться до вибору місць і створіть бронювання ще раз.</p>
          <Link href={`/movies/${movieId}`} className="inline-block bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold">
            До вибору сеансу
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1016] text-white">
      <Navbar />

      <main className="mx-auto max-w-[1160px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {!confirmed ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="space-y-5 rounded-2xl border border-slate-800 bg-[#111722] p-5 md:p-7 lg:col-span-7">
              <div>
                <h1 className="text-2xl font-bold">Оформлення замовлення</h1>
                <p className="text-sm text-gray-400 mt-2">
                  Вкажіть контактні дані для оформлення замовлення та електронних квитків.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500"><span>01 Сеанс</span><span>→</span><span>02 Місця</span><span>→</span><span className="font-semibold text-white">03 Оплата</span><span>→</span><span>04 Квиток</span></div>
              </div>

              {countdownLabel && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${secondsLeft === 0 ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>
                  {secondsLeft === 0
                    ? "Час бронювання минув. Поверніться до вибору місць і забронюйте їх знову."
                    : `Місця утримуються ще ${countdownLabel}.`}
                </div>
              )}

              <form onSubmit={handleConfirm} className="space-y-4">
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-white">Банківська картка</h2>
                  <div>
                    <label htmlFor="card-holder" className="mb-1 block text-xs text-slate-400">ІМ’Я ВЛАСНИКА КАРТКИ</label>
                    <input id="card-holder" type="text" autoComplete="cc-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label htmlFor="card-number" className="mb-1 block text-xs text-slate-400">НОМЕР КАРТКИ</label>
                    <input id="card-number" type="text" inputMode="numeric" autoComplete="cc-number" placeholder="•••• •••• •••• 4321" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} required maxLength={19} pattern="[0-9 ]{13,19}" className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="card-expiry" className="mb-1 block text-xs text-slate-400">ТЕРМІН ДІЇ</label>
                      <input id="card-expiry" type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} required maxLength={5} pattern="(0[1-9]|1[0-2])/[0-9]{2}" className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500" />
                    </div>
                    <div>
                      <label htmlFor="card-cvv" className="mb-1 block text-xs text-slate-400">CVV</label>
                      <input id="card-cvv" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} required maxLength={4} pattern="[0-9]{3,4}" className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500" />
                    </div>
                  </div>
                </section>

              {demoMode && (
                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                  <button type="button" onClick={() => { setDemoScenario("success"); setError(""); setShowExpiredDemo(false); }} className={`rounded-lg px-3 py-2 text-[10px] ${demoScenario === "success" ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-800 text-slate-400"}`}>Успішна оплата</button>
                  <button type="button" onClick={() => { setDemoScenario("declined"); setError(""); setShowExpiredDemo(false); }} className={`rounded-lg px-3 py-2 text-[10px] ${demoScenario === "declined" ? "bg-red-500/20 text-red-200" : "bg-slate-800 text-slate-400"}`}>Відхилена оплата</button>
                  <button type="button" onClick={() => setShowExpiredDemo(true)} className="rounded-lg bg-slate-800 px-3 py-2 text-[10px] text-slate-400 hover:text-white">Час вийшов</button>
                </div>
              )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="customer-email" className="mb-1 block text-xs text-slate-400">ЕЛЕКТРОННА ПОШТА</label>
                    <input
                      id="customer-email"
                      type="email"
                      autoComplete="email"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="mb-1 block text-xs text-slate-400">ТЕЛЕФОН</label>
                    <input
                      id="customer-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+380 67 123 45 67"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

                <button
                  type="submit"
                  disabled={confirming || isExpired}
                  className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {confirming ? "Обробляємо…" : demoMode && demoScenario === "declined" ? "ОПЛАТУ ВІДХИЛЕНО" : `СПЛАТИТИ • ${totalPrice} ГРН`}
                </button>
              </form>
            </div>

            <aside className="lg:col-span-5">
              <div className="sticky top-16 space-y-4 rounded-2xl border border-slate-800 bg-[#111722] p-5">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  {movie?.posterUrl && <Image src={movie.posterUrl} alt={movie.title || "Постер фільму"} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{movie?.title || "Ваше замовлення"}</h2>
                  <p className="text-sm text-red-400 mt-2">{selectedDate}{selectedTime ? ` • ${selectedTime}` : ""}</p>
                  <p className="text-sm text-gray-300 mt-2">{seatLabels.length ? seatLabels.join(", ") : "Місця обрано"}</p>
                </div>
                <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                  <span className="text-gray-400">{seatLabels.length || 1} квитки</span>
                  <span className="text-xl font-bold">{totalPrice} грн</span>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 py-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 text-green-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
              <h1 className="text-2xl font-bold">Оплата пройшла успішно!</h1>
              <p className="text-sm text-gray-400">Квитки сформовано. Збережіть QR-коди або покажіть їх під час входу.</p>
              <p className="text-sm text-gray-400">Email для замовлення: <span className="text-white">{customerEmail}</span></p>
      
            </div>

            {ticketData?.tickets?.length ? ticketData.tickets.map((ticket) => (
              <article key={ticket.id} className="bg-[#121621] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl bg-white p-2">
                  {ticket.qrCodeImage ? (
                    <Image src={ticket.qrCodeImage} alt={`QR-код квитка ${ticket.id}`} width={144} height={144} unoptimized className="h-full w-full object-contain" />
                  ) : (
                    <p className="text-black text-xs break-all text-center">{ticket.qrCode}</p>
                  )}
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <p className="text-xs font-bold tracking-widest text-red-500 uppercase">КіноКлік • Електронний квиток</p>
                  <h2 className="text-xl font-bold">{movie?.title || "Квиток"}</h2>
                  <p className="text-sm text-gray-300">{selectedDate}{selectedTime ? ` • ${selectedTime}` : ""}</p>
                  <p className="text-sm text-gray-300">{seatLabels.join(", ")}</p>
                  <p className="text-sm text-gray-400">{ticket.price} грн</p>
                  <p className="text-xs text-gray-500 break-all">Код квитка: {ticket.qrCode}</p>
                </div>
              </article>
            )) : (
              <p role="alert" className="text-center text-amber-200">Замовлення підтверджене, але бекенд не повернув список квитків.</p>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/tickets/my" className="inline-block rounded-lg bg-[#e3262d] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#f13a41]">До моїх квитків</Link>
              <Link href="/" className="inline-block rounded-lg border border-white/[0.07] bg-[#19202c] px-8 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-[#222b39]">До афіші</Link>
            </div>
          </div>
        )}
      </main>

      {isExpired && !confirmed && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="booking-expired-title" className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-[#111722] p-5 shadow-2xl">
            <p className="font-mono text-3xl font-bold text-red-500">00:00</p>
            <div>
              <h2 id="booking-expired-title" className="text-base font-bold">Час бронювання вичерпано</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">Місця більше не утримуються. Оберіть їх знову, щоб продовжити замовлення.</p>
            </div>
            <div className="grid gap-2">
              <Link href={`/movies/${movieId}/seats?sessionId=${encodeURIComponent(sessionId)}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`} className="rounded-lg bg-red-600 px-4 py-2.5 text-center text-xs font-bold text-white hover:bg-red-500">
                Обрати місця знову
              </Link>
              <Link href={`/movies/${movieId}`} className="rounded-lg bg-slate-800 px-4 py-2.5 text-center text-xs font-semibold text-slate-200 hover:bg-slate-700">
                До фільму
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1016] text-white text-center py-20">Завантаження...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
