import { GET } from "../src/app/api/scrape/route";
import { pool } from "../src/db";

async function main() {
  try {
    const response = await GET();
    const body = await response.text();

    console.log("SCRAPE STATUS:", response.status);
    console.log(body);

    if (!response.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("CRON SCRAPE ERROR:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
