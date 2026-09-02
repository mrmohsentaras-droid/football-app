import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totals = await db.execute(sql`
      SELECT
        COUNT(*)::int AS total_rows,
        COUNT(DISTINCT (
          match_date,
          match_time,
          league,
          home_team,
          away_team,
          source
        ))::int AS unique_rows
      FROM source_predictions
    `);

    const duplicates = await db.execute(sql`
      SELECT
        source,
        COUNT(*)::int AS duplicate_groups,
        COALESCE(SUM(cnt - 1), 0)::int AS duplicate_rows
      FROM (
        SELECT
          match_date,
          match_time,
          league,
          home_team,
          away_team,
          source,
          COUNT(*)::int AS cnt
        FROM source_predictions
        GROUP BY
          match_date,
          match_time,
          league,
          home_team,
          away_team,
          source
        HAVING COUNT(*) > 1
      ) x
      GROUP BY source
      ORDER BY duplicate_rows DESC
    `);

    const samples = await db.execute(sql`
      SELECT
        match_date,
        match_time,
        league,
        home_team,
        away_team,
        source,
        COUNT(*)::int AS count
      FROM source_predictions
      GROUP BY
        match_date,
        match_time,
        league,
        home_team,
        away_team,
        source
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC, source, match_date
      LIMIT 20
    `);

    const total = totals.rows[0] ?? {
      total_rows: 0,
      unique_rows: 0,
    };

    return Response.json({
      ok: true,
      totalRows: Number(total.total_rows),
      uniqueRows: Number(total.unique_rows),
      duplicateRows:
        Number(total.total_rows) - Number(total.unique_rows),
      duplicatesBySource: duplicates.rows,
      duplicateSamples: samples.rows,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 }
    );
  }
}
