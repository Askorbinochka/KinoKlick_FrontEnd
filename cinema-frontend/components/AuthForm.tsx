"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API_URL } from "@/app/api";

type AuthFormProps = { mode: "login" | "register" };

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get("registered") === "1");
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch(`${API_URL}/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister
          ? { email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() }
          : { email: email.trim(), password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(" ") : data.message;
        throw new Error(message || (isRegister ? "Не вдалося створити акаунт." : "Невірна пошта або пароль. Перевірте дані й спробуйте ще раз."));
      }

      const token = data.access_token || data.accessToken || data.token;
      if (token) {
        localStorage.setItem("kinoklik-token", String(token));
        const fallbackUser = { name: isRegister ? `${firstName.trim()} ${lastName.trim()}`.trim() : "", email: email.trim(), phone: phone.trim() };
        localStorage.setItem("kinoklik-user", JSON.stringify(fallbackUser));
        try {
          const profileResponse = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            const profileUser = {
              name: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || fallbackUser.name,
              email: profile.email || fallbackUser.email,
              phone: profile.phone || fallbackUser.phone,
            };
            localStorage.setItem("kinoklik-user", JSON.stringify(profileUser));
          }
        } catch {
          // The login token remains usable even if the optional profile refresh fails.
        }
        window.dispatchEvent(new Event("kinoklik-auth-change"));
        router.push("/tickets/my");
      } else if (isRegister) {
        router.push("/login?registered=1");
      } else {
        throw new Error("Сервер не повернув дані сесії. Спробуйте ще раз.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося виконати запит. Спробуйте ще раз.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1016] text-white">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1200px] flex-col items-center px-5 pb-16 pt-20">
        <section className="w-full max-w-[420px] rounded-xl border border-white/[0.07] bg-[#121720] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">{isRegister ? "Створіть акаунт" : "З поверненням!"}</h1>
          <p className="mt-2 text-sm text-slate-400">{isRegister ? "Зберігайте оплачені квитки в одному місці." : "Увійдіть, щоб переглядати свої квитки."}</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-[#0d1016] p-1">
            <Link href="/login" aria-current={!isRegister ? "page" : undefined} className={`rounded-md px-3 py-2 text-center text-sm font-semibold transition ${!isRegister ? "bg-[#19202c] text-white" : "text-slate-400 hover:text-white"}`}>Увійти</Link>
            <Link href="/register" aria-current={isRegister ? "page" : undefined} className={`rounded-md px-3 py-2 text-center text-sm font-semibold transition ${isRegister ? "bg-[#19202c] text-white" : "text-slate-400 hover:text-white"}`}>Реєстрація</Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {registered && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">Акаунт створено. Тепер увійдіть.</p>}
            {isRegister && <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="auth-first-name" className="mb-1.5 block text-sm font-medium text-slate-200">Ім’я</label>
                <input id="auth-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#19202c] px-3 text-sm outline-none transition focus:border-[#e3262d]" />
              </div>
              <div>
                <label htmlFor="auth-last-name" className="mb-1.5 block text-sm font-medium text-slate-200">Прізвище</label>
                <input id="auth-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" required className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#19202c] px-3 text-sm outline-none transition focus:border-[#e3262d]" />
              </div>
            </div>}
            {isRegister && <div>
              <label htmlFor="auth-phone" className="mb-1.5 block text-sm font-medium text-slate-200">Телефон</label>
              <input id="auth-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+380501234567" required className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#19202c] px-3 text-sm outline-none transition focus:border-[#e3262d]" />
            </div>}
            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-slate-200">Електронна пошта</label>
              <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required aria-invalid={Boolean(error)} className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#19202c] px-3 text-sm outline-none transition focus:border-[#e3262d] aria-[invalid=true]:border-red-500" />
              <p className="mt-1.5 text-xs text-slate-500">Вкажіть адресу вашого акаунта</p>
            </div>
            <div>
              <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-slate-200">Пароль</label>
              <input id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={8} aria-invalid={Boolean(error)} className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#19202c] px-3 text-sm outline-none transition focus:border-[#e3262d] aria-[invalid=true]:border-red-500" />
              <p className="mt-1.5 text-xs text-slate-500">Щонайменше 8 символів</p>
            </div>
            {error && <p role="alert" className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm leading-5 text-red-200">{error}</p>}
            <button type="submit" disabled={pending} className="h-11 w-full rounded-lg bg-[#e3262d] px-4 text-sm font-bold text-white transition hover:bg-[#f13a41] disabled:cursor-wait disabled:opacity-65">
              {pending ? "Зачекайте…" : isRegister ? "Зареєструватися" : "Увійти"}
            </button>
          </form>
          <Link href="/" className="mt-6 block text-center text-xs text-slate-400 transition hover:text-white">← Повернутися до афіші</Link>
        </section>
      </main>
    </div>
  );
}
