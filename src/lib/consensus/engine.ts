export function processConsensus(matches: any[]) {
  const groups: Record<string, any> = {};
  for (const m of matches) {
    const key = `${m.home}-${m.away}`;
    if (!groups[key]) {
      groups[key] = {
        home: m.home,
        away: m.away,
        league: m.league,
        consensusTip: m.tip,
        sources: [m.source],
        agreementCount: 1,
        sourceCount: 1,
        confidenceScore: 60
      };
    } else {
      groups[key].sources.push(m.source);
      groups[key].agreementCount += 1;
      groups[key].sourceCount += 1;
      groups[key].confidenceScore = Math.min(95, groups[key].confidenceScore + 15);
    }
  }
  return Object.values(groups);
}
