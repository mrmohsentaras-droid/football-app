import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS source_predictions (
        id SERIAL PRIMARY KEY,
        match_date TEXT NOT NULL,
        match_time TEXT NOT NULL,
        league TEXT NOT NULL,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        source TEXT NOT NULL,
        tip TEXT NOT NULL,
        home_goals INTEGER,
        away_goals INTEGER,
        is_correct BOOLEAN,
        scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
        result_checked_at TIMESTAMP
      );
    `);

    const before = await client.query(`
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
      FROM source_predictions;
    `);

    const deleteResult = await client.query(`
      WITH ranked AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY
              match_date,
              match_time,
              league,
              home_team,
              away_team,
              source
            ORDER BY id
          ) AS rn
        FROM source_predictions
      )
      DELETE FROM source_predictions sp
      USING ranked r
      WHERE sp.id = r.id
        AND r.rn > 1;
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS source_predictions_unique_match_source_idx
      ON source_predictions (
        match_date,
        match_time,
        league,
        home_team,
        away_team,
        source
      );
    `);

    const after = await client.query(`
      SELECT COUNT(*)::int AS total_rows
      FROM source_predictions;
    `);

    await client.query("COMMIT");

    console.log(
      "Migration OK:",
      `before=${before.rows[0].total_rows}`,
      `unique_before=${before.rows[0].unique_rows}`,
      `deleted=${deleteResult.rowCount ?? 0}`,
      `after=${after.rows[0].total_rows}`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
