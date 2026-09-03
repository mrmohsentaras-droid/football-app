'use client';

import { useEffect, useState } from 'react';

interface Match {
  rank?: number;
  time?: string;
  date?: string;
  home: string;
  away: string;
  league: string;
  consensusTip: string;
  confidenceScore: number;
  agreementCount: number;
  sourceCount: number;
  sources: string[];
}

export default function Home() {
  const [topPicks, setTopPicks] = useState<Match[]>([]);
  const [allPredictions, setAllPredictions] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/scrape?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          const swapTeams = (list: Match[]) =>
            (list || []).map((m) => ({
              ...m,
              home: m.away,
              away: m.home
            }));

          setTopPicks(swapTeams(data.topPicks));
          setAllPredictions(swapTeams(data.allPredictions));
        }
      } catch (err) {
        console.error('Failed to load predictions', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#0d0f12] text-white p-4 max-w-2xl mx-auto font-sans" dir="ltr">
      {/* Header */}
      <header className="flex items-center justify-between py-4 border-b border-gray-800 mb-6">
        <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
          ⚡
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-tight text-white">PRO AI FOOTBALL</h1>
          <p className="text-[10px] text-emerald-400 font-mono tracking-wider">CONSENSUS ENGINE V2.0</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-950 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Consensus
          </span>
        </div>
      </header>

      {/* Top Daily Picks Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            👑 Top 2 Daily Picks
          </h2>
          <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md font-medium">
            High Confidence
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">Loading predictions...</div>
        ) : (
          <div className="space-y-4">
            {topPicks.map((match, idx) => (
              <div key={idx} className="bg-[#14181d] border border-gray-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-[11px]">
                    RANK #{match.rank || idx + 1}
                  </span>
                  <span>{match.league}</span>
                </div>

                {/* Match Time / Date */}
                <div className="text-center my-1">
                  <span className="text-[10px] bg-gray-800/80 text-gray-400 font-mono px-2 py-0.5 rounded">
                    🕒 {match.time || '20:00'} | {match.date || '2026-09-03'}
                  </span>
                </div>

                {/* Match Teams */}
                <div className="flex items-center justify-between my-3 text-center">
                  <div className="w-2/5 font-bold text-base text-gray-100">{match.home}</div>
                  <div className="w-1/5 text-xs text-gray-500 font-bold bg-gray-800/50 py-1 rounded-md">VS</div>
                  <div className="w-2/5 font-bold text-base text-gray-100">{match.away}</div>
                </div>

                {/* Agreed Source Badges */}
                <div className="flex flex-wrap items-center gap-1.5 my-3 justify-center">
                  <span className="text-[10px] text-gray-400 font-medium mr-1">Agreeing Sources:</span>
                  {(match.sources || []).map((src, sIdx) => (
                    <span key={sIdx} className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      ✓ {src}
                    </span>
                  ))}
                </div>

                {/* Stats Footer */}
                <div className="mt-4 pt-3 border-t border-gray-800/60 bg-[#0d0f12]/50 -mx-5 -mb-5 p-4 flex justify-between items-center rounded-b-2xl">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">SUGGESTED PICK</div>
                    <div className="text-emerald-400 font-bold text-lg">{match.consensusTip}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">CONFIDENCE SCORE</div>
                    <div className="text-amber-400 font-bold text-lg">{match.confidenceScore}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Predictions Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-100">All Scraped Predictions</h2>
          <span className="text-xs text-gray-500">Matches {allPredictions.length}</span>
        </div>

        <div className="space-y-3">
          {allPredictions.map((match, idx) => (
            <div key={idx} className="bg-[#14181d] border border-gray-800/60 rounded-xl p-4">
              <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                <span className="text-gray-500 font-mono">🕒 {match.time || '20:00'}</span>
                <span>{match.league}</span>
              </div>

              <div className="flex justify-between items-center font-semibold text-sm mb-3">
                <span className="text-gray-200">{match.home}</span>
                <span className="text-xs text-gray-500 font-normal px-2">vs</span>
                <span className="text-gray-200">{match.away}</span>
              </div>

              {/* Source Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(match.sources || []).map((src, sIdx) => (
                  <span key={sIdx} className="bg-gray-800/80 text-gray-300 text-[9px] px-1.5 py-0.5 rounded border border-gray-700/50">
                    {src}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-800/40 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block uppercase">PICK</span>
                  <span className="font-bold text-emerald-400">{match.consensusTip}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] block uppercase">AGREEMENT</span>
                  <span className="font-bold text-gray-200">Sources {match.agreementCount}/{match.sourceCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
