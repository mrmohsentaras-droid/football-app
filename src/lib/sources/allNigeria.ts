import * as cheerio from "cheerio";

export interface SourceMatch {
  source: string;
  date: string;
  time: string;
  league: string;
  home: string;
  away: string;
  tip: string;
}

export function parseAllNigeria(html: string): SourceMatch[] {
  const $ = cheerio.load(html);
  const result: SourceMatch[] = [];

  $("p").each((_, el) => {
    const lines = $(el)
      .text()
      .split(/\n/)
      .map((x) => x.trim())
      .filter(Boolean);

    if (lines.length < 3) return;

    const dateMatch = lines[0].match(
      /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/
    );

    if (!dateMatch) return;

    const matchLine = lines[2]
      .replace(/\u2013/g, "-")
      .replace(/\u2014/g, "-");

    const parts = matchLine.split(/\s+-\s+/);

    if (parts.length < 2) return;

    const teams = parts[0].split(/\s+vs\s+/i);

    if (teams.length !== 2) return;

    const home = teams[0].trim();
    const away = teams[1].trim();
    const tip = parts.slice(1).join(" - ").trim();

    if (!home || !away || !tip) return;

    result.push({
      source: "AllNigeriaFootball",
      date: dateMatch[1],
      time: dateMatch[2],
      league: lines[1],
      home,
      away,
      tip,
    });
  });

  return result;
}

export async function fetchAllNigeria(): Promise<SourceMatch[]> {
  const response = await fetch("https://allnigeriafootball.com/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(
      `AllNigeriaFootball HTTP ${response.status}`
    );
  }

  const html = await response.text();

  return parseAllNigeria(html);
}
