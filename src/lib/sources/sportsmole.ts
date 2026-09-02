import type { SourceMatch } from "./allNigeria";

const BASE_URL = "https://www.sportsmole.co.uk";
const INDEX_URL = `${BASE_URL}/football/preview/`;

function cleanText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#039;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#039;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function extractLinks(html: string): string[] {
  const regex =
    /href=["'](\/football\/[^"']+\/preview\/[^"']+\.html)["']/gi;

  const links: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const url = href.startsWith("http")
      ? href
      : `${BASE_URL}${href}`;

    if (!links.includes(url)) {
      links.push(url);
    }
  }

  return links;
}

function parseMatchFromUrl(url: string): {
  home: string;
  away: string;
} | null {
  const match = url.match(
    /\/preview\/([^/]+)-vs-([^/]+)-prediction-team-news-lineups/i
  );

  if (!match) return null;

  const formatTeam = (value: string): string =>
    value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

  return {
    home: formatTeam(match[1]),
    away: formatTeam(match[2]),
  };
}

function scoreToTip(homeGoals: number, awayGoals: number): string {
  if (homeGoals > awayGoals) return "1";
  if (awayGoals > homeGoals) return "2";
  return "X";
}

async function fetchArticle(url: string): Promise<SourceMatch | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const html = await response.text();

    const teams = parseMatchFromUrl(url);
    if (!teams) return null;

    const text = cleanText(decodeHtml(html));

    const dateMatch = text.match(
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s+\d{1,2}\.\d{2}(?:am|pm)/i
    );

    const scoreMatch = text.match(
      /We say:\s*[^0-9]{0,80}(\d+)\s*[-–]\s*(\d+)/i
    );

    if (!scoreMatch) return null;

    const homeGoals = Number(scoreMatch[1]);
    const awayGoals = Number(scoreMatch[2]);

    let date = "";
    let time = "";

    if (dateMatch) {
      const parsed = dateMatch[0].match(
        /([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2})\.(\d{2})(am|pm)/i
      );

      if (parsed) {
        date = `${parsed[1]} ${parsed[2]}, ${parsed[3]}`;
        time = `${parsed[4]}:${parsed[5]} ${parsed[6].toUpperCase()}`;
      }
    }

    return {
      source: "Sports Mole",
      date,
      time,
      league: "Football",
      home: teams.home,
      away: teams.away,
      tip: scoreToTip(homeGoals, awayGoals),
    };
  } catch {
    return null;
  }
}

export async function fetchSportsMole(): Promise<SourceMatch[]> {
  const response = await fetch(INDEX_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Sports Mole HTTP ${response.status}`);
  }

  const html = await response.text();

  const links = extractLinks(html);

  console.log(`Sports Mole preview links: ${links.length}`);

  const results: SourceMatch[] = [];

  for (const url of links) {
    const match = await fetchArticle(url);

    if (match) {
      results.push(match);
    }
  }

  return results;
}
