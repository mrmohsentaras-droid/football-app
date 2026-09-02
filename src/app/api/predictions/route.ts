import { NextResponse } from "next/server";
import { db } from "@/db";
import { predictions, sourcePredictions } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allPreds = await db
      .select()
      .from(predictions)
      .orderBy(desc(predictions.confidenceScore));

    // فقط Top Pickهایی که قبلاً توسط موتور اجماع تأیید شده‌اند
    const sourceRows = await db.select().from(sourcePredictions);

    const withSources = allPreds.map((prediction) => ({
      ...prediction,
      sources: Array.from(
        new Set(
          sourceRows
            .filter(
              (row) =>
                row.matchDate === prediction.matchDate &&
                row.matchTime === prediction.matchTime &&
                row.league === prediction.league &&
                row.homeTeam === prediction.homeTeam &&
                row.awayTeam === prediction.awayTeam
            )
            .map((row) => row.source)
        )
      ),
    }));

    const topPicks = withSources
      .filter(
        (prediction) =>
          prediction.isTopPick === true &&
          prediction.pickRank !== null
      )
      .sort(
        (a, b) =>
          (a.pickRank ?? 99) - (b.pickRank ?? 99)
      )
      .slice(0, 2)
      .map((prediction, index) => ({
        ...prediction,
        isTopPick: true,
        pickRank: index + 1,
      }));

    return NextResponse.json({
      topPicks,
      allPredictions: withSources,
      lastUpdated:
        allPreds.length > 0
          ? allPreds[0].scrapedAt
          : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "خطا در بارگذاری پیش‌بینی‌ها",
      },
      { status: 500 }
    );
  }
}
