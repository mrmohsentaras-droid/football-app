import { NextResponse } from "next/server";
import { db } from "@/db";
import { predictions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isUpcomingMatch } from "@/lib/scraper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allPreds = await db
      .select()
      .from(predictions)
      .orderBy(desc(predictions.confidenceScore));

    // فقط Top Pickهایی که قبلاً توسط موتور اجماع تأیید شده‌اند
    const topPicks = allPreds
      .filter(
        (prediction) =>
          prediction.isTopPick === true &&
          prediction.pickRank !== null &&
          isUpcomingMatch(prediction)
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
      allPredictions: allPreds,
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
