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

function parseBlock(
  $: cheerio.CheerioAPI,
  el: any
): SourceMatch | null {
  const dateText = $(el)
    .find(".teams .ownheader")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const dateMatch = dateText.match(
    /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/
  );

  if (!dateMatch) return null;

  const home = $(el)
    .find(".hostteam .name")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const away = $(el)
    .find(".guestteam .name")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const tip = $(el)
    .find(".tip .value")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  if (!home || !away || !tip) return null;

  return {
    source: "Statarea",
    date: dateMatch[1],
    time: dateMatch[2],
    league: "",
    home,
    away,
    tip,
  };
}

export function parseStatarea(html: string): SourceMatch[] {
  const $ = cheerio.load(html);
  const result: SourceMatch[] = [];
  const seen = new Set<string>();

  $(".match, .cmatch").each((_, el) => {
    const match = parseBlock($, el);

    if (!match) return;

    const key = [
      match.date,
      match.home.toLowerCase(),
      match.away.toLowerCase(),
    ].join("|");

    if (seen.has(key)) return;

    seen.add(key);
    result.push(match);
  });

  return result;
}

export async function fetchStatarea(): Promise<SourceMatch[]> {
  const response = await fetch("https://www.statarea.com/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Statarea HTTP ${response.status}`);
  }

  const html = await response.text();

  return parseStatarea(html);
}
