"use client";

import { useState, useEffect, useCallback } from "react";

interface Prediction {
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
  scrapedAt: string;
}

export default function Home() {
  const [topPicks, setTopPicks] = useState<Prediction[]>([]);
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      if (data.topPicks) setTopPicks(data.topPicks);
      if (data.allPredictions) setAllPredictions(data.allPredictions);
      if (data.lastUpdated) setLastUpdated(data.lastUpdated);
      setError(null);
    } catch {
      setError("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    setError(null);
    try {
      const res = await fetch("/api/scrape");
      const data = await res.json();
      if (data.error && !data.success) {
        setError(data.error);
      } else {
        await fetchPredictions();
      }
    } catch {
      setError("خطا در دریافت داده‌ها از سایت");
    } finally {
      setScraping(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return "from-emerald-500 to-emerald-600";
    if (score >= 50) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 70) return "اطمینان بالا 🔥";
    if (score >= 50) return "اطمینان متوسط ⚡";
    return "ریسک بالا ⚠️";
  };

  const getLeagueFlag = (league: string) => {
    const l = league.toLowerCase();
    if (l.includes("england")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
    if (l.includes("spain")) return "🇪🇸";
    if (l.includes("germany")) return "🇩🇪";
    if (l.includes("italy")) return "🇮🇹";
    if (l.includes("france")) return "🇫🇷";
    if (l.includes("portugal")) return "🇵🇹";
    if (l.includes("saudi")) return "🇸🇦";
    if (l.includes("brazil")) return "🇧🇷";
    if (l.includes("turkey") || l.includes("türkiye")) return "🇹🇷";
    if (l.includes("china")) return "🇨🇳";
    if (l.includes("ukraine")) return "🇺🇦";
    if (l.includes("russia")) return "🇷🇺";
    if (l.includes("denmark")) return "🇩🇰";
    if (l.includes("egypt")) return "🇪🇬";
    if (l.includes("uae")) return "🇦🇪";
    if (l.includes("wales")) return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
    return "⚽";
  };

  const formatTip = (tip: string) => {
    const t = tip.toLowerCase();
    if (t === "1") return "برد میزبان";
    if (t === "2") return "برد مهمان";
    if (t === "x") return "مساوی";
    if (t === "x2") return "مساوی یا برد مهمان";
    if (t === "1x") return "برد میزبان یا مساوی";
    if (t === "12") return "برد میزبان یا مهمان";
    if (t.includes("over")) return `بیش از ${t.replace("over ", "")} گل`;
    if (t.includes("under")) return `کمتر از ${t.replace("under ", "")} گل`;
    if (t.includes("draw no bet")) return `بدون باخت: ${tip.replace(/\(draw no bet\)/i, "").trim()}`;
    return tip;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" dir="rtl">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <span className="text-4xl">⚽</span>
                پیش‌بینی فوتبال
              </h1>
              <p className="text-slate-400 mt-2 text-sm md:text-base">
                تحلیل هوشمند و انتخاب مطمئن‌ترین بازی‌ها برای شرط‌بندی
              </p>
              <p className="text-indigo-400 text-xs mt-1">
                منبع: allnigeriafootball.com
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
              >
                {scraping ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    در حال دریافت...
                  </>
                ) : (
                  <>
                    🔄 بروزرسانی پیش‌بینی‌ها
                  </>
                )}
              </button>
              {lastUpdated && (
                <span className="text-slate-500 text-xs">
                  آخرین بروزرسانی: {new Date(lastUpdated).toLocaleString("fa-IR")}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-12">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading && allPredictions.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-slate-400">در حال بارگذاری...</p>
            </div>
          </div>
        )}

        {!loading && allPredictions.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-6">🏟️</div>
            <h2 className="text-2xl font-bold text-white mb-3">هنوز پیش‌بینی‌ای ثبت نشده</h2>
            <p className="text-slate-400 mb-6 max-w-md">
              برای دریافت آخرین پیش‌بینی‌ها و انتخاب مطمئن‌ترین بازی‌ها، دکمه بروزرسانی را بزنید
            </p>
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
              {scraping ? "در حال دریافت..." : "🚀 شروع دریافت پیش‌بینی‌ها"}
            </button>
          </div>
        )}

        {/* TOP PICKS */}
        {topPicks.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-1.5 h-8 rounded-full" />
              <h2 className="text-2xl font-bold text-white">🏆 ۲ انتخاب برتر امروز</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topPicks.map((pick, idx) => (
                <div
                  key={pick.id}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity blur-sm" />
                  <div className="relative bg-slate-900 rounded-2xl p-6 border border-amber-500/20">
                    {/* Rank Badge */}
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <span className="text-xl font-black text-slate-900">
                        {idx + 1}
                      </span>
                    </div>

                    {/* League */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{getLeagueFlag(pick.league)}</span>
                      <span className="text-amber-400 text-sm font-medium">{pick.league}</span>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 text-center">
                        <p className="text-white font-bold text-lg leading-tight">{pick.homeTeam}</p>
                        <p className="text-slate-500 text-xs mt-1">میزبان</p>
                      </div>
                      <div className="px-4">
                        <div className="bg-slate-800 rounded-lg px-3 py-2">
                          <span className="text-slate-500 text-xs block text-center">VS</span>
                          <span className="text-white font-mono text-sm">{pick.matchTime}</span>
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-white font-bold text-lg leading-tight">{pick.awayTeam}</p>
                        <p className="text-slate-500 text-xs mt-1">مهمان</p>
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-400 text-xs mb-1">پیش‌بینی پیشنهادی</p>
                          <p className="text-white font-bold text-lg">{formatTip(pick.tip)}</p>
                          <p className="text-slate-500 text-xs mt-1">({pick.tip})</p>
                        </div>
                        <div className="text-left">
                          <div className={`bg-gradient-to-r ${getConfidenceColor(pick.confidenceScore)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                            {getConfidenceLabel(pick.confidenceScore)}
                          </div>
                          <p className="text-slate-400 text-xs mt-1 text-center">
                            امتیاز: {pick.confidenceScore}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    {pick.reasoning && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs leading-relaxed">
                          💡 {pick.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                      <span className="text-slate-500 text-xs">📅 {pick.matchDate}</span>
                      <span className="text-slate-500 text-xs">⏰ {pick.matchTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ALL PREDICTIONS */}
        {allPredictions.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-1.5 h-8 rounded-full" />
              <h2 className="text-xl font-bold text-white">📊 همه پیش‌بینی‌ها ({allPredictions.length} بازی)</h2>
            </div>

            <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-right text-slate-400 text-xs font-medium px-4 py-3">#</th>
                      <th className="text-right text-slate-400 text-xs font-medium px-4 py-3">لیگ</th>
                      <th className="text-right text-slate-400 text-xs font-medium px-4 py-3">بازی</th>
                      <th className="text-right text-slate-400 text-xs font-medium px-4 py-3">ساعت</th>
                      <th className="text-right text-slate-400 text-xs font-medium px-4 py-3">پیش‌بینی</th>
                      <th className="text-right text-slate-400 text-xs font-medium px-4 py-3">امتیاز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPredictions.map((pred, idx) => (
                      <tr
                        key={pred.id}
                        className={`border-b border-slate-800/50 transition-colors hover:bg-slate-800/30 ${
                          pred.isTopPick ? "bg-amber-500/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm">
                          {pred.isTopPick ? (
                            <span className="bg-amber-500 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {pred.pickRank}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">{idx + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getLeagueFlag(pred.league)}</span>
                            <span className="text-slate-300 text-xs">{pred.league}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white text-sm font-medium">
                            {pred.homeTeam}
                          </span>
                          <span className="text-slate-600 mx-2">vs</span>
                          <span className="text-white text-sm font-medium">
                            {pred.awayTeam}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-400 text-xs font-mono">{pred.matchTime}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-indigo-400 text-sm font-medium">
                            {formatTip(pred.tip)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(pred.confidenceScore)}`}
                                style={{ width: `${Math.min(100, pred.confidenceScore)}%` }}
                              />
                            </div>
                            <span className="text-slate-400 text-xs">{pred.confidenceScore}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-slate-600 text-xs leading-relaxed max-w-2xl mx-auto">
            ⚠️ هشدار: شرط‌بندی ریسک مالی دارد. این اطلاعات صرفاً جهت سرگرمی ارائه شده و تضمینی برای سود نیست.
            فقط مبلغی را شرط ببندید که توانایی از دست دادن آن را دارید. 🔞 +۱۸
          </p>
        </div>
      </main>
    </div>
  );
}
