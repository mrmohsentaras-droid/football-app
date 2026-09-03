import { NextResponse } from 'next/server';
import { scrapeAllNigeriaFootball } from '@/lib/scrapers/allNigeriaFootball';
import { processConsensus } from '@/lib/consensus/engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const scrapedMatches = await scrapeAllNigeriaFootball();
    const consensusResults = processConsensus(scrapedMatches);

    const topPicks = consensusResults.slice(0, 2);

    return NextResponse.json({
      success: true,
      topPicks,
      allPredictions: consensusResults
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
