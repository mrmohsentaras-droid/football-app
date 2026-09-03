import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedMatch } from '../consensus/engine';

export async function scrapeAllNigeriaFootball(): Promise<ScrapedMatch[]> {
  try {
    const { data } = await axios.get('https://allnigeriafootball.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const matches: ScrapedMatch[] = [];

    $('table tr').each((_, element) => {
      const cols = $(element).find('td');
      if (cols.length >= 2) {
        const matchText = $(cols[0]).text().trim();
        const tipText = $(cols[1]).text().trim();

        if (matchText.includes('vs') || matchText.includes('-')) {
          const parts = matchText.split(/vs|-/i);
          if (parts.length === 2) {
            matches.push({
              home: parts[0].trim(),
              away: parts[1].trim(),
              league: 'General',
              tip: tipText || '1',
              source: 'AllNigeriaFootball',
              time: '20:00',
              date: '2026-09-03'
            });
          }
        }
      }
    });

    return matches;
  } catch (error) {
    console.error('Error scraping AllNigeriaFootball:', error);
    return [];
  }
}
