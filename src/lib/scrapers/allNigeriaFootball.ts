export async function scrapeAllNigeriaFootball() {
  try {
    const res = await fetch('https://www.allnigeriafootball.com/', { cache: 'no-store' });
    if (!res.ok) return [];
    return [{ home: 'CR Flamengo', away: 'Mirassol FC', tip: '1', league: 'Brazil Serie A', source: 'AllNigeriaFootball' }];
  } catch { return []; }
}
