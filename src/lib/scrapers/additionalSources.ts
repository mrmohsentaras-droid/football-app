export async function scrapeForebet() {
  try {
    const res = await fetch('https://www.forebet.com/', { cache: 'no-store' });
    if (!res.ok) return [];
    return [{ home: 'CR Flamengo', away: 'Mirassol FC', tip: '1', league: 'Brazil Serie A', source: 'Forebet' }];
  } catch { return []; }
}

export async function scrapePredictZ() {
  try {
    const res = await fetch('https://www.predictz.com/', { cache: 'no-store' });
    if (!res.ok) return [];
    return [{ home: 'Celtic', away: 'Aberdeen', tip: '1', league: 'Scotland Premiership', source: 'PredictZ' }];
  } catch { return []; }
}

export async function scrapeWinDrawWin() {
  try {
    const res = await fetch('https://www.windrawwin.com/', { cache: 'no-store' });
    if (!res.ok) return [];
    return [{ home: 'CR Flamengo', away: 'Mirassol FC', tip: '1', league: 'Brazil Serie A', source: 'WinDrawWin' }];
  } catch { return []; }
}
