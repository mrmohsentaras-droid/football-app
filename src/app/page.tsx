"use client";

import { useEffect, useMemo, useState } from "react";

type Prediction = {
  id: number;
  matchDate: string;
  matchTime: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  tip: string;
  confidenceScore: number;
  isTopPick: boolean;
  pickRank: number | null;
  reasoning: string | null;
  sources: string[];
};

type ApiResponse = {
  topPicks: Prediction[];
  allPredictions: Prediction[];
  lastUpdated: string | null;
};

function flag(league: string) {
  const l = league.toLowerCase();
  if (l.includes("england")) return "🏴";
  if (l.includes("scotland")) return "🏴";
  if (l.includes("germany")) return "🇩🇪";
  if (l.includes("brazil")) return "🇧🇷";
  if (l.includes("spain")) return "🇪🇸";
  if (l.includes("italy")) return "🇮🇹";
  if (l.includes("france")) return "🇫🇷";
  if (l.includes("portugal")) return "🇵🇹";
  if (l.includes("netherlands")) return "🇳🇱";
  if (l.includes("belgium")) return "🇧🇪";
  return "🌍";
}

function tipText(tip: string) {
  const map: Record<string, string> = {
    "1": "برد میزبان",
    "2": "برد مهمان",
    "X": "مساوی",
    "1X": "میزبان یا مساوی",
    "X2": "مهمان یا مساوی",
    "12": "برد یکی از دو تیم",
  };
  return map[tip.toUpperCase()] ?? tip;
}

function scoreClass(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-yellow-400";
  return "text-orange-400";
}

export default function Home() {
  const [data, setData] = useState<ApiResponse>({
    topPicks: [],
    allPredictions: [],
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("all");

  async function loadPredictions() {
    try {
      setError("");
      const response = await fetch("/api/predictions", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت پیش‌بینی‌ها");
      }

      const json = await response.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/scrape", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("به‌روزرسانی ناموفق بود");
      }

      await loadPredictions();
    } catch (e: any) {
      setError(e.message || "خطا در بروزرسانی");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPredictions();
  }, []);

  const dates = useMemo(() => {
    return Array.from(
      new Set(data.allPredictions.map((p) => p.matchDate))
    ).sort();
  }, [data.allPredictions]);

  const predictions = useMemo(() => {
    if (date === "all") return data.allPredictions;
    return data.allPredictions.filter((p) => p.matchDate === date);
  }, [data.allPredictions, date]);

  const topPicks = useMemo(() => {
    if (date === "all") return data.topPicks;
    return data.topPicks.filter((p) => p.matchDate === date);
  }, [data.topPicks, date]);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 text-sm font-semibold text-cyan-400">
              MULTI-SOURCE CONSENSUS ENGINE
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              ⚽ Football AI
            </h1>
            <p className="mt-2 text-slate-400">
              تحلیل و مقایسه پیش‌بینی چند منبع فوتبال
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "⏳ در حال بروزرسانی..." : "🔄 بروزرسانی پیش‌بینی‌ها"}
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-300">
            ⚠️ {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-sm text-slate-400">کل پیش‌بینی‌ها</div>
            <div className="mt-2 text-3xl font-black">
              {data.allPredictions.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-sm text-slate-400">انتخاب‌های برتر</div>
            <div className="mt-2 text-3xl font-black text-emerald-400">
              {data.topPicks.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-sm text-slate-400">آخرین بروزرسانی</div>
            <div className="mt-2 text-sm font-bold text-slate-200">
              {data.lastUpdated
                ? new Date(data.lastUpdated).toLocaleString("fa-IR")
                : "—"}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 text-sm font-bold text-slate-300">
            📅 انتخاب تاریخ
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDate("all")}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${
                date === "all"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              همه
            </button>

            {dates.map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  date === d
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {new Date(d + "T12:00:00").toLocaleDateString("fa-IR")}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-sm font-bold text-cyan-400">
                TOP PICKS
              </div>
              <h2 className="text-2xl font-black">
                دو انتخاب با بالاترین اجماع
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              ⏳ در حال دریافت داده‌ها...
            </div>
          ) : topPicks.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              برای این تاریخ انتخاب واجد شرایطی وجود ندارد.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {topPicks.map((p) => (
                <article
                  key={p.id}
                  className="relative overflow-hidden rounded-3xl border border-emerald-900/70 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl"
                >
                  <div className="absolute left-0 top-0 h-1 w-full bg-emerald-400" />

                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400">
                      PICK #{p.pickRank}
                    </span>
                    <span className="text-3xl font-black">
                      {p.confidenceScore}
                      <span className="text-sm text-slate-500">/100</span>
                    </span>
                  </div>

                  <div className="mb-2 text-sm text-slate-400">
                    {flag(p.league)} {p.league}
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-5 text-center">
                    <div className="text-lg font-black sm:text-xl">
                      {p.homeTeam}
                    </div>
                    <div className="text-sm font-bold text-slate-600">
                      VS
                    </div>
                    <div className="text-lg font-black sm:text-xl">
                      {p.awayTeam}
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl bg-slate-800/80 p-4 text-center">
                    <div className="text-xs text-slate-400">
                      پیشنهاد اجماع
                    </div>
                    <div className="mt-1 text-xl font-black text-emerald-400">
                      {tipText(p.tip)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      📅 {p.matchDate} • {p.matchTime}
                    </span>
                    <span className={scoreClass(p.confidenceScore)}>
                      اعتماد بالا
                    </span>
                  </div>


                  {p.reasoning && (
                    <p className="mt-4 border-t border-slate-800 pt-4 text-xs leading-6 text-slate-400">
                      {p.reasoning}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <div className="text-sm font-bold text-cyan-400">
              ALL PREDICTIONS
            </div>
            <h2 className="text-2xl font-black">
              تمام نتایج اجماع
            </h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                ⏳ در حال بارگذاری...
              </div>
            ) : predictions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                داده‌ای برای نمایش وجود ندارد.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {predictions.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="mb-1 text-xs text-slate-500">
                        {flag(p.league)} {p.league}
                      </div>
                      <div className="font-bold">
                        {p.homeTeam}{" "}
                        <span className="mx-2 text-slate-600">vs</span>{" "}
                        {p.awayTeam}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {p.matchDate} • {p.matchTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-center">
                        <div className="text-xs text-slate-500">
                          پیش‌بینی
                        </div>
                        <div className="font-black text-cyan-400">
                          {tipText(p.tip)}
                        </div>
                      </div>

                      <div className="min-w-20 text-center">
                        <div className="text-xs text-slate-500">
                          امتیاز
                        </div>
                        <div
                          className={`text-2xl font-black ${scoreClass(
                            p.confidenceScore
                          )}`}
                        >
                          {p.confidenceScore}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 text-center text-xs leading-6 text-amber-200/70">
          ⚠️ این سیستم بر اساس اجماع منابع و داده‌های آماری امتیازدهی می‌کند.
          هیچ پیش‌بینی فوتبالی قطعی نیست و امتیاز اعتماد به معنی تضمین نتیجه
          نیست.
        </footer>
      </div>
    </main>
  );
}
