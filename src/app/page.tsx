'use client';

import { useEffect, useState } from 'react';

interface Match {
  rank?: number;
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
        const res = await fetch('/api/scrape');
        const data = await res.json();
        if (data.success) {
          setTopPicks(data.topPicks || []);
          setAllPredictions(data.allPredictions || []);
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
    <main className="min-h-screen bg-[#0d0f12] text-white p-4 max-w-2xl mx-auto font-sans">
      {/* Header */}
      <header className="flex items-center justify-between py-4 border-b border-gray-800 mb-6">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-950 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Consensus
          </span>
        </div>
        <div className="text-right">
          <h1 className="text-lg font-bold tracking-tight text-white">PRO AI FOOTBALL</h1>
          <p className="text-[10px] text-emerald-400 font-mono tracking-wider">CONSENSUS ENGINE V2.0</p>
        </div>
        <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
          ⚡
        </div>
      </header>

      {/* Top Daily Picks Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md font-medium">
            High Confidence
          </span>
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            Top 2 Daily Picks 👑
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">در حال بارگذاری پیشنهادات...</div>
        ) : (
          <div className="space-y-4">
            {topPicks.map((match, idx) => (
              <div key={idx} className="bg-[#14181d] border border-gray-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                  <span>{match.league}</span>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-[11px]">
                    #{match.rank || idx + 1} RANK
                  </span>
                </div>

                {/* Strict Team Alignment: Home (Left) VS Away (Right) */}
                <div className="flex items-center justify-between my-2 text-center">
                  <div className="w-2/5 font-bold text-base text-gray-100 text-left">{match.home}</div>
                  <div className="w-1/5 text-xs text-gray-500 font-bold bg-gray-800/50 py-1 rounded-md">VS</div>
                  <div className="w-2/5 font-bold text-base text-gray-100 text-right">{match.away}</div>
                </div>

                {/* Stats Footer */}
                <div className="mt-5 pt-4 border-t border-gray-800/60 bg-[#0d0f12]/50 -mx-5 -mb-5 p-4 flex justify-between items-center rounded-b-2xl">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">CONFIDENCE SCORE</div>
                    <div className="text-amber-400 font-bold text-lg">{match.confidenceScore}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">SUGGESTED PICK</div>
                    <div className="text-emerald-400 font-bold text-lg">{match.consensusTip}</div>
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
          <span className="text-xs text-gray-500">Matches {allPredictions.length}</span>
          <h2 className="text-lg font-bold text-gray-100">All Scraped Predictions</h2>
        </div>

        <div className="space-y-3">
          {allPredictions.map((match, idx) => (
            <div key={idx} className="bg-[#14181d] border border-gray-800/60 rounded-xl p-4">
              <div className="text-right text-[11px] text-gray-400 mb-2">{match.league}</div>
              <div className="flex justify-between items-center font-semibold text-sm mb-3">
                <span className="text-gray-200">{match.home}</span>
                <span className="text-xs text-gray-500 font-normal px-2">vs</span>
                <span className="text-gray-200">{match.away}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-800/40 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block uppercase">AGREEMENT</span>
                  <span className="font-bold text-gray-200">Sources {match.agreementCount}/{match.sourceCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] block uppercase">PICK</span>
                  <span className="font-bold text-emerald-400">{match.consensusTip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
