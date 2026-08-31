import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "پیش‌بینی فوتبال | انتخاب مطمئن‌ترین بازی‌ها",
  description:
    "تحلیل هوشمند بازی‌های فوتبال و انتخاب ۲ مطمئن‌ترین بازی برای شرط‌بندی بر اساس داده‌های allnigeriafootball.com",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
