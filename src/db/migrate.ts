import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  try {
    await pool.query(`
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

    console.log("OK: source_predictions table ready");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
