export function processConsensus(matches: any[]) {
  const map = new Map<string, any>();

  for (const item of matches) {
    if (!item || !item.home || !item.away) continue;
    
    const key = `${item.home.trim().toLowerCase()}-${item.away.trim().toLowerCase()}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        home: item.home,
        away: item.away,
        league: item.league || 'Unknown',
        consensusTip: item.tip || '1',
        sources: [item.source],
        agreementCount: 1,
        sourceCount: 1,
        confidenceScore: 60
      });
    } else {
      if (!existing.sources.includes(item.source)) {
        existing.sources.push(item.source);
        existing.agreementCount += 1;
        existing.sourceCount += 1;
        existing.confidenceScore = Math.min(98, existing.confidenceScore + 12);
      }
    }
  }

  return Array.from(map.values());
}
