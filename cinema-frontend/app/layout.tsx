import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "КіноКлік — квитки в кіно",
  description: "Обирайте фільми, сеанси та місця у кінотеатрі КіноКлік.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto border-t border-white/[0.05] px-5 py-5 text-center text-[11px] text-slate-600">
          © 2026 КіноКлік
        </footer>
      </body>
    </html>
  );
}
