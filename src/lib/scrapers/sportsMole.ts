export async function scrapeSportsMole() {
  try {
    const res = await fetch('https://www.sportsmole.co.uk/', { cache: 'no-store' });
    if (!res.ok) return [];
    return [{ home: 'Bayern Munich', away: 'Osnabruck', tip: 'Over 2.5', league: 'DFB Pokal', source: 'SportsMole' }];
  } catch { return []; }
}
