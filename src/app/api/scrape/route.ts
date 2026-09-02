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
    const [anf, statarea, soccervista, sportsmole, forebet, predictz, windrawwin] = await Promise.allSettled([
      scrapeAllNigeriaFootball(),
      scrapeStatarea(),
      scrapeSoccerVista(),
      scrapeSportsMole(),
      scrapeForebet(),
      scrapePredictZ(),
      scrapeWinDrawWin()
    ]);

    const anfVal = anf.status === 'fulfilled' ? anf.value : [];
    const statVal = statarea.status === 'fulfilled' ? statarea.value : [];
    const svVal = soccervista.status === 'fulfilled' ? soccervista.value : [];
    const smVal = sportsmole.status === 'fulfilled' ? sportsmole.value : [];
    const fbVal = forebet.status === 'fulfilled' ? forebet.value : [];
    const pzVal = predictz.status === 'fulfilled' ? predictz.value : [];
    const wdwVal = windrawwin.status === 'fulfilled' ? wdwVal.value : [];

    const allMatches = [
      ...anfVal,
      ...statVal,
      ...svVal,
      ...smVal,
      ...fbVal,
      ...pzVal,
      ...wdwVal
    ];

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
