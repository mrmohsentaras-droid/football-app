import { NextResponse } from "next/server";
import { scrapeAllNigeriaFootball } from "@/lib/scrapers/allNigeriaFootball";
import { processConsensus } from "@/lib/consensus/engine";
import { db } from "@/db";
import { predictions } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scrapedMatches = await scrapeAllNigeriaFootball();
    const consensusResults = processConsensus(scrapedMatches);

    const topPicks = consensusResults.slice(0, 2);

    // پاک کردن داده‌های قبلی
    await db.execute(sql`DELETE FROM predictions`);

    // ذخیره داده‌های جدید
    if (consensusResults.length > 0) {
      await db.insert(predictions).values(
        consensusResults.map((m, index) => ({
          matchDate: m.date || "2026-09-03",
          matchTime: m.time || "20:00",
          league: m.league,
          homeTeam: m.home,
          awayTeam: m.away,
          tip: m.consensusTip,
          confidenceScore: m.confidenceScore,
          isTopPick: index < 2,
          pickRank: index < 2 ? index + 1 : null,
          reasoning: `اجماع ${m.agreementCount} از ${m.sourceCount} منبع`,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      totalMatchesScraped: consensusResults.length,
      topPicks,
      allPredictions: consensusResults,
    });

  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
