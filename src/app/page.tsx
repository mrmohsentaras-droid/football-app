import React from 'react';

export const revalidate = 0;

async function getPredictionsData() {
  try {
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : 'https://football-app-production-843e.up.railway.app';

    const res = await fetch(`${baseUrl}/api/scrape`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getPredictionsData();
  const topPicks = data?.topPicks || [];
  const allPredictions = data?.allPredictions || [];

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16 selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#07090e]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-black text-xl">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PRO AI FOOTBALL
              </h1>
              <p className="text-[10px] text-emerald-400 tracking-wider uppercase font-semibold">Consensus Engine v2.0</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Consensus
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-12">
        
        {/* Top Picks Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-2xl">👑</span>
              <h2 className="text-xl font-bold tracking-tight text-white">Top 2 Daily Picks</h2>
            </div>
            <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">High Confidence</span>
          </div>

          {topPicks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-slate-400">
              در حال حاضر پیش‌بینی جدیدی ثبت نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topPicks.map((pick: any) => (
                <div 
                  key={pick.rank}
                  className="relative group rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.01] p-6 border border-amber-500/30 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-amber-500/60 hover:shadow-amber-500/10 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                    <span className="text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      RANK #{pick.rank}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{pick.league}</span>
                  </div>

                  <div className="text-center space-y-2 py-2">
                    <div className="text-xs font-semibold text-slate-400">{pick.time}</div>
                    <div className="flex items-center justify-center gap-3 text-lg font-extrabold text-white">
                      <span className="flex-1 text-right">{pick.home}</span>
                      <span className="text-xs font-normal text-slate-500 px-2 py-1 bg-white/5 rounded">VS</span>
                      <span className="flex-1 text-left">{pick.away}</span>
                    </div>
                  </div>

                  {/* Pick Banner */}
                  <div className="mt-5 p-4 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Suggested Pick</p>
                      <p className="text-base font-bold text-emerald-400 mt-0.5">{pick.consensusTip}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Confidence Score</p>
                      <p className="text-lg font-black text-amber-400 mt-0.5">{pick.confidenceScore}%</p>
                    </div>
                  </div>

                  {pick.reasoning && (
                    <p className="mt-4 text-xs text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/5 leading-relaxed">
                      {pick.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* All Predictions Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">All Scraped Predictions</h2>
            <span className="text-xs text-slate-400">{allPredictions.length} Matches</span>
          </div>
          
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md overflow-hidden">
            <div className="divide-y divide-white/5">
              {allPredictions.map((pred: any, index: number) => (
                <div key={index} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-400">{pred.league}</span>
                      <span className="text-xs text-slate-500">{pred.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{pred.home} <span className="text-slate-500 font-normal">vs</span> {pred.away}</p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase text-slate-400 block">Pick</span>
                      <span className="text-sm font-bold text-emerald-400">{pred.consensusTip}</span>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase text-slate-400 block">Agreement</span>
                      <span className="text-sm font-bold text-slate-300">{pred.agreementCount}/{pred.sourceCount} Sources</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
