export interface ScrapedMatch {
  home: string;
  away: string;
  league: string;
  tip: string;
  source: string;
  time?: string;
  date?: string;
}

export interface ConsensusMatch {
  rank?: number;
  home: string;
  away: string;
  league: string;
  consensusTip: string;
  confidenceScore: number;
  agreementCount: number;
  sourceCount: number;
  sources: string[];
  time?: string;
  date?: string;
}

// تابع هوشمند برای تمیزکاری نام تیم‌ها (مثلاً تبدیل Celtic FC یا Celtic Glasgow به celtic)
function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(fc|cf|sc|afc|club|glasgow|city|united|town)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// تابع تمیزکاری پیش‌بینی‌ها (مثلاً تبدیل Home Win به 1)
function normalizeTip(tip: string): string {
  if (!tip) return '1';
  const t = tip.toLowerCase().trim();
  if (t.includes('home') || t === '1' || t.includes('1/1')) return '1';
  if (t.includes('away') || t === '2' || t.includes('2/2')) return '2';
  if (t.includes('draw') || t === 'x') return 'X';
  if (t.includes('over 2.5') || t.includes('ov2.5') || t.includes('over')) return 'Over 2.5';
  if (t.includes('under 2.5') || t.includes('un2.5') || t.includes('under')) return 'Under 2.5';
  if (t.includes('bts') || t.includes('gg')) return 'BTS';
  return tip.toUpperCase();
}

export function processConsensus(matches: ScrapedMatch[]): ConsensusMatch[] {
  const groups: { [key: string]: ScrapedMatch[] } = {};

  matches.forEach((m) => {
    const cleanHome = normalizeName(m.home);
    const cleanAway = normalizeName(m.away);
    const key = `${cleanHome}_vs_${cleanAway}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(m);
  });

  const results: ConsensusMatch[] = [];

  Object.values(groups).forEach((group) => {
    if (group.length === 0) return;

    const first = group[0];
    const tipsCount: { [tip: string]: { count: number; sources: string[] } } = {};

    group.forEach((item) => {
      const cleanTip = normalizeTip(item.tip);
      if (!tipsCount[cleanTip]) {
        tipsCount[cleanTip] = { count: 0, sources: [] };
      }
      tipsCount[cleanTip].count += 1;
      if (!tipsCount[cleanTip].sources.includes(item.source)) {
        tipsCount[cleanTip].sources.push(item.source);
      }
    });

    let bestTip = '';
    let maxAgreements = 0;
    let agreeingSources: string[] = [];

    Object.entries(tipsCount).forEach(([tip, data]) => {
      if (data.count > maxAgreements) {
        maxAgreements = data.count;
        bestTip = tip;
        agreeingSources = data.sources;
      }
    });

    const totalSources = new Set(group.map((g) => g.source)).size;
    const confidenceScore = Math.round((maxAgreements / Math.max(totalSources, 1)) * 100);

    results.push({
      home: first.home,
      away: first.away,
      league: first.league || 'Football League',
      consensusTip: bestTip || '1',
      confidenceScore,
      agreementCount: maxAgreements,
      sourceCount: totalSources,
      sources: agreeingSources,
      time: first.time || '20:00',
      date: first.date || '2026-09-03'
    });
  });

  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
