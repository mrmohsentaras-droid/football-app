import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT
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
    `);

    return Response.json({
      ok: true,
      ...result.rows[0],
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
