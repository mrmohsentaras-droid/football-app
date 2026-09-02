async function triggerScrape() {
  const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'https://football-app-production-843e.up.railway.app';

  console.log(`Sending scrape request to: ${baseUrl}/api/scrape ...`);

  try {
    const res = await fetch(`${baseUrl}/api/scrape`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log('✅ Scrape completed successfully!');
    console.log(`Matches Scraped: ${data.totalMatchesScraped || data.consensusMatches || 0}`);
    console.log(`Active Sources:`, data.sources || `${data.activeSourcesCount || 0} sources`);
  } catch (error: any) {
    console.error('❌ Scrape request failed:', error.message);
  }
}

triggerScrape();
