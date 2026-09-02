import { NextResponse } from 'next/server';
import { scrapeAllNigeriaFootball } from '@/lib/scrapers/allNigeriaFootball';
import { scrapeStatarea } from '@/lib/scrapers/statarea';
import { scrapeSoccerVista } from '@/lib/scrapers/soccerVista';
import { scrapeSportsMole } from '@/lib/scrapers/sportsMole';
import { scrapeForebet, scrapePredictZ, scrapeWinDrawWin } from '@/lib/scrapers/additionalSources';
import { processConsensus } from '@/lib/consensus/engine';
import { getTopPicks } from '@/lib/consensus/topPicks';

export const maxDuration = 60; // افزایش زمان مجاز اجرا به ۶۰ ثانیه

export async function GET() {
  try {
    // اجرای هم‌زمان تمام ۷ منبع معتبر
    const [anf, statarea, soccervista, sportsmole, forebet, predictz, windrawwin] = await Promise.allSettled([
      scrapeAllNigeriaFootball(),
      scrapeStatarea(),
      scrapeSoccerVista(),
      scrapeSportsMole(),
      scrapeForebet(),
      scrapePredictZ(),
      scrapeWinDrawWin()
    ]);

    const allMatches = [
      ...(anf.status === 'fulfilled' ? anf.value : []),
      ...(statarea.status === 'fulfilled' ? statarea.value : []),
      ...(soccervista.status === 'fulfilled' ? soccervista.value : []),
      ...(sportsmole.status === 'fulfilled' ? sportsmole.value : []),
      ...(forebet.status === 'fulfilled' ? forebet.value : []),
      ...(predictz.status === 'fulfilled' ? predictz.value : []),
      ...(windrawwin.status === 'fulfilled' ? windrawwin.value : [])
    ];

    const consensusResults = processConsensus(allMatches);
    const topPicks = getTopPicks(consensusResults, 2);

    return NextResponse.json({
      success: true,
      totalMatchesScraped: allMatches.length,
      activeSourcesCount: 7,
      topPicks,
      allPredictions: consensusResults
    });
  } catch (error: any) {
    console.error('Error in scraper route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
