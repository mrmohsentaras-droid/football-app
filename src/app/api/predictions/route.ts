import { NextResponse } from "next/server";
import { db } from "@/db";
import { predictions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topPicks = await db
      .select()
      .from(predictions)
      .where(eq(predictions.isTopPick, true))
      .orderBy(predictions.pickRank);

    const allPreds = await db
      .select()
      .from(predictions)
      .orderBy(desc(predictions.confidenceScore));

    return NextResponse.json({
      topPicks,
      allPredictions: allPreds,
      lastUpdated: allPreds.length > 0 ? allPreds[0].scrapedAt : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "خطا در بارگذاری" },
      { status: 500 }
    );
  }
}
