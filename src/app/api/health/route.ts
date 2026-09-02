import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);

    const result = await db.execute(
      sql`select count(*)::int as count from source_predictions`
    );

    return Response.json({
      ok: true,
      sourcePredictions: Number(result.rows[0]?.count ?? 0),
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
