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

interface SoccerVistaEvent {
  homeParticipant?: string | { name?: string };
  awayParticipant?: string | { name?: string };
  tournament?: string | { name?: string };
  date?: string;
  time?: string;
  matchWinnerPrediction?: {
    outcome?: number;
    participantName?: string;
  };
  goalsScoredPrediction?: {
    outcome?: string;
  };
  correctScorePrediction?: {
    outcome?: {
      score?: string;
      btts?: string;
    };
  };
}

function getParticipantName(
  participant: string | { name?: string } | undefined
): string {
  if (!participant) return "";
  if (typeof participant === "string") return participant.trim();
  return participant.name?.trim() ?? "";
}

function getTip(event: SoccerVistaEvent): string {
  const winner = event.matchWinnerPrediction?.outcome;

  if (winner === 1) return "1";
  if (winner === 2) return "2";
  if (winner === 0) return "X";

  const goals = event.goalsScoredPrediction?.outcome?.toUpperCase();

  if (goals === "O") return "Over 2.5";
  if (goals === "U") return "Under 2.5";

  return "";
}

function decodeEmbeddedJson(raw: string): SoccerVistaEvent {
  const decoded = raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");

  return JSON.parse(decoded) as SoccerVistaEvent;
}

function parseEventHtml(html: string): SoccerVistaEvent | null {
  const marker = "getEventOdds(JSON.parse('";
  const start = html.indexOf(marker);

  if (start < 0) return null;

  const jsonStart = start + marker.length;
  const end = html.indexOf("'))", jsonStart);

  if (end < 0) return null;

  const raw = html.slice(jsonStart, end);

  try {
    return decodeEmbeddedJson(raw);
  } catch {
    return null;
  }
}

function parseDate(dateText: string): string {
  const match = dateText.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return "";

  const months: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04",
    May: "05", June: "06", July: "07", August: "08",
    September: "09", October: "10", November: "11", December: "12",
  };

  const month = months[match[2]];
  if (!month) return "";

  return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`SoccerVista HTTP ${response.status}`);
  }

  return response.text();
}

export async function fetchSoccerVistaLeague(
  leagueUrl: string
): Promise<SourceMatch[]> {
  const html = await fetchHtml(leagueUrl);
  const $ = cheerio.load(html);

  const eventUrls: string[] = [];
  const seen = new Set<string>();

  $("script[type='application/ld+json']").each((_, el) => {
    const text = $(el).text().trim();

    if (!text) return;

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return;
    }

    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (!item || typeof item !== "object") continue;

      const x = item as Record<string, unknown>;
      const type = x["@type"];

      const isSportsEvent =
        type === "SportsEvent" ||
        (Array.isArray(type) && type.includes("SportsEvent"));

      if (!isSportsEvent) continue;

      const url =
        typeof x.url === "string"
          ? x.url
          : "";

      if (!url || seen.has(url)) continue;

      seen.add(url);
      eventUrls.push(url);
    }
  });

  const results: SourceMatch[] = [];

  for (const eventUrl of eventUrls) {
    try {
      const eventHtml = await fetchHtml(eventUrl);
      const event = parseEventHtml(eventHtml);

      if (!event) continue;

      const home = getParticipantName(event.homeParticipant);
      const away = getParticipantName(event.awayParticipant);
      const tip = getTip(event);

      if (!home || !away || !tip) continue;

      const date = parseDate(event.date ?? "");

      if (!date) continue;

      results.push({
        source: "SoccerVista",
        date,
        time: event.time ?? "",
        league: getParticipantName(event.tournament),
        home,
        away,
        tip,
      });
    } catch {
      continue;
    }
  }

  return results;
}
