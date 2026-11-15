import { Suspense } from "react";
import AdminSessionsPage from "@/components/admin/AdminSessionsPage";

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#0b0e13] px-5 text-sm text-slate-400">Завантажуємо адмін-панель…</div>}>
      <AdminSessionsPage />
    </Suspense>
  );
}
