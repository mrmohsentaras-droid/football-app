import { NextResponse } from "next/server";
import { db } from "@/db";
import { predictions, sourcePredictions } from "@/db/schema";
import { fetchAllNigeria } from "@/lib/sources/allNigeria";
import type { SourceMatch } from "@/lib/sources/allNigeria";
import { fetchStatarea } from "@/lib/sources/statarea";
import { fetchSoccerVistaLeague } from "@/lib/sources/soccervista";
import { fetchSportsMole } from "@/lib/sources/sportsmole";
import { SOCCERVISTA_LEAGUES } from "@/lib/sources/soccervistaLeagues";
import { buildConsensus } from "@/lib/consensus/buildConsensus";
import { selectConsensusTopPicks } from "@/lib/consensus/topPicks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // دریافت AllNigeria
    let allNigeria: SourceMatch[] = [];
    try {
      allNigeria = await fetchAllNigeria();
      console.log(`AllNigeriaFootball: ${allNigeria.length}`);
    } catch (error) {
      console.error("AllNigeriaFootball error:", error);
    }

    // دریافت Statarea
    let statarea: SourceMatch[] = [];
    try {
      statarea = await fetchStatarea();
      console.log(`Statarea: ${statarea.length}`);
    } catch (error) {
      console.error("Statarea error:", error);
    }

    // دریافت SoccerVista از تمام لیگ‌های تنظیم‌شده
    const soccerVista: SourceMatch[] = [];

    for (const league of SOCCERVISTA_LEAGUES) {
      try {
        const matches = await fetchSoccerVistaLeague(league.url);

        console.log(
          `SoccerVista ${league.name}: ${matches.length}`
        );

        soccerVista.push(...matches);
      } catch (error) {
        console.error(
          `SoccerVista ${league.name} error:`,
          error
        );
      }
    }

    console.log(`SoccerVista total: ${soccerVista.length}`);

    // دریافت Sports Mole
    let sportsMole: SourceMatch[] = [];
    try {
      sportsMole = await fetchSportsMole();
      console.log(`Sports Mole: ${sportsMole.length}`);
    } catch (error) {
      console.error("Sports Mole error:", error);
    }

    // ساخت اجماع چندمنبعی
    const consensus = buildConsensus(
      allNigeria,
      statarea,
      soccerVista,
      sportsMole
    );

    console.log(`Consensus matches: ${consensus.length}`);

    // ذخیره پیش‌بینی خام همه منابع برای ارزیابی عملکرد آینده
    const rawPredictions = [
      ...allNigeria,
      ...statarea,
      ...soccerVista,
      ...sportsMole,
    ];

    if (rawPredictions.length > 0) {
      const existing = await db
        .select({
          matchDate: sourcePredictions.matchDate,
          matchTime: sourcePredictions.matchTime,
          league: sourcePredictions.league,
          homeTeam: sourcePredictions.homeTeam,
          awayTeam: sourcePredictions.awayTeam,
          source: sourcePredictions.source,
        })
        .from(sourcePredictions);

      const existingKeys = new Set(
        existing.map(
          (row) =>
            `${row.matchDate}|${row.matchTime}|${row.league}|${row.homeTeam}|${row.awayTeam}|${row.source}`
        )
      );

      const newPredictions = rawPredictions.filter((match) => {
        const key = `${match.date}|${match.time}|${match.league}|${match.home}|${match.away}|${match.source}`;

        if (existingKeys.has(key)) {
          return false;
        }

        existingKeys.add(key);
        return true;
      });

      if (newPredictions.length > 0) {
        await db.insert(sourcePredictions).values(
          newPredictions.map((match) => ({
            matchDate: match.date,
            matchTime: match.time,
            league: match.league,
            homeTeam: match.home,
            awayTeam: match.away,
            source: match.source,
            tip: match.tip,
          }))
        );
      }

      console.log(
        `Raw source predictions: ${rawPredictions.length} fetched, ${newPredictions.length} new, ${rawPredictions.length - newPredictions.length} duplicates skipped`
      );
    }

    // انتخاب حداکثر ۲ بازی با بالاترین اطمینان
    const topPicks = selectConsensusTopPicks(consensus, 2);

    console.log(`Top picks: ${topPicks.length}`);

    // پاک کردن داده‌های قبلی
    await db.delete(predictions);

    // ذخیره نتایج اجماع
    if (consensus.length > 0) {
      const allToInsert = consensus.map((match) => {
        const topIndex = topPicks.findIndex(
          (pick) =>
            pick.date === match.date &&
            pick.time === match.time &&
            pick.home === match.home &&
            pick.away === match.away
        );

        const isTop = topIndex !== -1;

        return {
          matchDate: match.date,
          matchTime: match.time,
          league: match.league,
          homeTeam: match.home,
          awayTeam: match.away,
          tip: match.consensusTip,
          confidenceScore: match.confidenceScore,
          isTopPick: isTop,
          pickRank: isTop ? topIndex + 1 : null,
          reasoning: match.reasoning,
        };
      });

      await db.insert(predictions).values(allToInsert);
    }

    return NextResponse.json({
      success: true,
      sources: {
        allNigeria: allNigeria.length,
        statarea: statarea.length,
        soccerVista: soccerVista.length,
        sportsMole: sportsMole.length,
      },
      consensusMatches: consensus.length,
      topPicks: topPicks.map((pick, index) => ({
        rank: index + 1,
        ...pick,
      })),
      allPredictions: consensus,
    });
  } catch (error: any) {
    console.error("Scrape error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "خطا در دریافت و پردازش پیش‌بینی‌ها",
      },
      { status: 500 }
    );
  }
}
