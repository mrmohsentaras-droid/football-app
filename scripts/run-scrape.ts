import axios from 'axios';

async function triggerScrape() {
  const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'https://football-app-production-843e.up.railway.app';

  console.log(`Sending scrape request to: ${baseUrl}/api/scrape ...`);

  try {
    const response = await axios.get(`${baseUrl}/api/scrape`, { timeout: 60000 });
    console.log('Scrape completed successfully!');
    console.log(`Total Matches: ${response.data.totalMatchesScraped}`);
    console.log(`Active Sources: ${response.data.activeSourcesCount}`);
  } catch (error: any) {
    console.error('Scrape request failed:', error.message);
  }
}

triggerScrape();
