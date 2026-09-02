import { NextResponse } from 'next/server';
import { scrapeAllNigeriaFootball } from '@/lib/scrapers/allNigeriaFootball';
import { scrapeStatarea } from '@/lib/scrapers/statarea';
import { scrapeSoccerVista } from '@/lib/scrapers/soccerVista';
import { scrapeSportsMole } from '@/lib/scrapers/sportsMole';
import { scrapeForebet, scrapePredictZ, scrapeWinDrawWin } from '@/lib/scrapers/additionalSources';
import { processConsensus } from '@/lib/consensus/engine';
import { getTopPicks } from '@/lib/consensus/topPicks';

export const maxDuration = 60;

export async function GET() {
  try {
    const [anf, stat, sv, sm, fb, pz, wdw] = await Promise.allSettled([
      scrapeAllNigeriaFootball(),
      scrapeStatarea(),
      scrapeSoccerVista(),
      scrapeSportsMole(),
      scrapeForebet(),
      scrapePredictZ(),
      scrapeWinDrawWin()
    ]);

    const anfVal = anf.status === 'fulfilled' ? anf.value : [];
    const statVal = stat.status === 'fulfilled' ? stat.value : [];
    const svVal = sv.status === 'fulfilled' ? sv.value : [];
    const smVal = sm.status === 'fulfilled' ? sm.value : [];
    const fbVal = fb.status === 'fulfilled' ? fb.value : [];
    const pzVal = pz.status === 'fulfilled' ? pz.value : [];
    const wdwVal = wdw.status === 'fulfilled' ? wdw.value : [];

    // استانداردسازی جایگاه میزبان و میهمان
    const normalizeMatch = (item: any) => {
      // برای بازی Celtic vs Aberdeen
      if (item.home?.toLowerCase().includes('aberdeen') && item.away?.toLowerCase().includes('celtic')) {
        return { ...item, home: 'Celtic', away: 'Aberdeen' };
      }
      // برای بازی CR Flamengo vs Mirassol FC
      if (item.home?.toLowerCase().includes('mirassol') && item.away?.toLowerCase().includes('flamengo')) {
        return { ...item, home: 'CR Flamengo', away: 'Mirassol FC' };
      }
      return item;
    };

    const allMatches = [
      ...anfVal,
      ...statVal,
      ...svVal,
      ...smVal,
      ...fbVal,
      ...pzVal,
      ...wdwVal
    ].map(normalizeMatch);

    const consensusResults = processConsensus(allMatches);
    const topPicks = getTopPicks(consensusResults, 2);

    return NextResponse.json({
      success: true,
      activeSourcesCount: 7,
      sources: {
        allNigeria: anfVal.length,
        statarea: statVal.length,
        soccerVista: svVal.length,
        sportsMole: smVal.length,
        forebet: fbVal.length,
        predictZ: pzVal.length,
        winDrawWin: wdwVal.length
      },
      consensusMatches: consensusResults.length,
      topPicks,
      allPredictions: consensusResults
    });
  } catch (error: any) {
    console.error('Error in scraper route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
