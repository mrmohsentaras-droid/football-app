import { execSync } from "child_process";

const url = "https://football-app-production-843e.up.railway.app/api/scrape";

console.log(`Sending scrape request to: ${url} ...`);

try {
  const output = execSync(`curl -s ${url}`, { encoding: "utf8" });
  const data = JSON.parse(output);

  console.log("✅ Scrape completed successfully!");
  console.log(`Matches Scraped: ${data.totalMatchesScraped || data.consensusMatches || 0}`);
  console.log("Active Sources:", data.sources || data.activeSourcesCount || 0);
} catch (error: any) {
  console.error("❌ Scrape request failed:", error.message);
}
