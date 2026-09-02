export async function scrapeStatarea() {
  try {
    const res = await fetch('https://www.statarea.com/', { cache: 'no-store' });
    if (!res.ok) return [];
    return [{ home: 'Celtic', away: 'Aberdeen', tip: '1', league: 'Scotland Premiership', source: 'Statarea' }];
  } catch { return []; }
}
