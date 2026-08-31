import { NextResponse } from "next/server";
import { db } from "@/db";
import { predictions } from "@/db/schema";
import { scrapeFromWebsite, scorePredictions, selectTopPicks } from "@/lib/scraper";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawPredictions = await scrapeFromWebsite();

    if (rawPredictions.length === 0) {
      return NextResponse.json(
        { error: "هیچ پیش‌بینی‌ای یافت نشد", predictions: [] },
        { status: 200 }
      );
    }

    const scored = scorePredictions(rawPredictions);
    const topPicks = selectTopPicks(scored, 2);

    // Clear old data
    await db.delete(predictions);

    // Insert all predictions
    const allToInsert = scored.map((p) => {
      const isTop = topPicks.includes(p);
      const rank = isTop ? topPicks.indexOf(p) + 1 : null;
      return {
        matchDate: p.matchDate,
        matchTime: p.matchTime,
        league: p.league,
        homeTeam: p.homeTeam,
        awayTeam: p.awayTeam,
        tip: p.tip,
        confidenceScore: p.confidenceScore,
        isTopPick: isTop,
        pickRank: rank,
        reasoning: p.reasoning,
      };
    });

    await db.insert(predictions).values(allToInsert);

    return NextResponse.json({
      success: true,
      total: scored.length,
      topPicks: topPicks.map((p, i) => ({
        rank: i + 1,
        ...p,
      })),
      allPredictions: scored.sort((a, b) => b.confidenceScore - a.confidenceScore),
    });
  } catch (error: any) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error.message || "خطا در دریافت داده‌ها" },
      { status: 500 }
    );
  }
}
