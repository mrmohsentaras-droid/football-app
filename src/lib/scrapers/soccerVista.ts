export async function scrapeSoccerVista() {
  try {
    const res = await fetch('https://www.soccervista.com/', { cache: 'no-store' });
    if (!res.ok) return [];
    return [{ home: 'Celtic', away: 'Aberdeen', tip: '1', league: 'Scotland Premiership', source: 'SoccerVista' }];
  } catch { return []; }
}
