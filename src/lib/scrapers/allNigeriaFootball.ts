import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedMatch } from '../consensus/engine';

export async function scrapeAllNigeriaFootball(): Promise<ScrapedMatch[]> {
  try {
    const { data } = await axios.get('https://allnigeriafootball.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 12000
    });

    const $ = cheerio.load(data);
    const matches: ScrapedMatch[] = [];

    $('tr').each((_, element) => {
      const text = $(element).text().trim();
      const cols = $(element).find('td');

      if (cols.length >= 2) {
        const rawMatch = $(cols[0]).text().trim();
        const rawTip = $(cols[1]).text().trim();

        if (rawMatch.match(/vs|-/i)) {
          const parts = rawMatch.split(/vs|-/i);
          if (parts.length >= 2) {
            matches.push({
              home: parts[0].trim(),
              away: parts[1].trim(),
              league: 'General League',
              tip: rawTip || '1',
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
