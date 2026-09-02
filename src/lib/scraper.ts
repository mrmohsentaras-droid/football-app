import * as cheerio from "cheerio";

export interface RawPrediction {
  matchDate: string;
  matchTime: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  tip: string;
}

export interface ScoredPrediction extends RawPrediction {
  confidenceScore: number;
  reasoning: string;
}

// Top leagues get higher confidence
const TOP_LEAGUES: Record<string, number> = {
  "england premier league": 35,
  "spain laliga": 32,
  "germany bundesliga": 32,
  "italy serie a": 30,
  "france ligue 1": 28,
  "portugal primeira liga": 25,
  "saudi pro league": 20,
  "turkey super lig": 15,
  "türkiye süper lig": 15,
  "brazil brasileiro serie a": 18,
  "denmark superliga": 12,
  "russia premier league": 12,
  "ukraine premier league": 10,
};

// Known strong teams that are reliable picks when favored
const STRONG_TEAMS = [
  "manchester city", "arsenal", "liverpool", "real madrid", "barcelona",
  "bayern munich", "psg", "inter milan", "ac milan", "juventus",
  "napoli", "borussia dortmund", "atletico madrid", "sporting lisbon",
  "benfica", "porto", "al hilal", "al nassr", "al ahly",
  "the new saints", "celtic", "rangers",
  "manchester united", "chelsea", "tottenham",
  "rb leipzig", "bayer leverkusen",
];

// Tip type reliability scores
function getTipScore(tip: string): { score: number; reason: string } {
  const t = tip.toLowerCase().trim();

  // Outright win (1 or 2) - very clear pick
  if (t === "1" || t === "2") {
    return { score: 28, reason: "پیش‌بینی برد قطعی (پیکه مستقیم)" };
  }
  // Double chance
  if (t === "x2" || t === "12" || t === "1x") {
    return { score: 25, reason: "شانس دوگانه – احتمال بالای موفقیت" };
  }
  // Over goals
  if (t.startsWith("over")) {
    const goals = parseFloat(t.replace("over ", "").replace("over", ""));
    if (goals <= 1.5) return { score: 24, reason: "بیش از ۱.۵ گل – بسیار محتمل" };
    if (goals <= 2.5) return { score: 20, reason: "بیش از ۲.۵ گل – محتمل" };
    return { score: 14, reason: "بیش از ۳.۵ گل – ریسک بالاتر" };
  }
  // Under goals
  if (t.startsWith("under")) {
    const goals = parseFloat(t.replace("under ", "").replace("under", ""));
    if (goals >= 3.5) return { score: 22, reason: "کمتر از ۳.۵ گل – احتمال بالا" };
    if (goals >= 2.5) return { score: 18, reason: "کمتر از ۲.۵ گل – نسبتا مطمئن" };
    return { score: 12, reason: "کمتر از ۱.۵ گل – ریسک بالا" };
  }
  // Draw No Bet
  if (t.includes("draw no bet")) {
    return { score: 23, reason: "بدون باخت در تساوی – امن‌تر" };
  }
  // BTTS
  if (t === "gg" || t === "btts yes") {
    return { score: 16, reason: "هر دو تیم گلزنی – متوسط" };
  }

  return { score: 10, reason: "نوع شرط نامشخص" };
}

function getTeamScore(homeTeam: string, awayTeam: string, tip: string): { score: number; reason: string } {
  const home = homeTeam.toLowerCase();
  const away = awayTeam.toLowerCase();
  const t = tip.toLowerCase().trim();

  let score = 0;
  let reasons: string[] = [];

  const homeIsStrong = STRONG_TEAMS.some((team) => home.includes(team));
  const awayIsStrong = STRONG_TEAMS.some((team) => away.includes(team));

  // Strong team picked to win or double chance including them
  if (t === "1" && homeIsStrong) {
    score += 25;
    reasons.push(`${homeTeam} تیم قدرتمند – میزبان`);
  } else if (t === "2" && awayIsStrong) {
    score += 25;
    reasons.push(`${awayTeam} تیم قدرتمند – مهمان`);
  } else if (t === "x2" && awayIsStrong) {
    score += 22;
    reasons.push(`${awayTeam} تیم قدرتمند در شانس دوگانه`);
  } else if (t === "1x" && homeIsStrong) {
    score += 22;
    reasons.push(`${homeTeam} تیم قدرتمند در شانس دوگانه`);
  } else if ((t.includes("draw no bet")) && (homeIsStrong || awayIsStrong)) {
    score += 20;
    reasons.push("تیم قدرتمند با حفاظت تساوی");
  }

  // Mismatch bonus: one strong, one not
  if ((homeIsStrong && !awayIsStrong) || (!homeIsStrong && awayIsStrong)) {
    score += 10;
    reasons.push("اختلاف قدرت قابل توجه بین دو تیم");
  }

  return {
    score,
    reason: reasons.length > 0 ? reasons.join(" | ") : "تیم‌های متعادل",
  };
}

function getLeagueScore(league: string): { score: number; reason: string } {
  const l = league.toLowerCase();
  for (const [key, val] of Object.entries(TOP_LEAGUES)) {
    if (l.includes(key)) {
      return { score: val, reason: `لیگ معتبر: ${league}` };
    }
  }
  return { score: 5, reason: `لیگ: ${league}` };
}

function getMatchTimestamp(matchDate: string, matchTime: string): number | null {
  const dateMatch = matchDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = matchTime.match(/^(\d{2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
}

export function isUpcomingMatch(prediction: RawPrediction, now: Date = new Date()): boolean {
  const timestamp = getMatchTimestamp(prediction.matchDate, prediction.matchTime);

  if (timestamp === null) return false;

  return timestamp > now.getTime();
}

export function scorePredictions(predictions: RawPrediction[]): ScoredPrediction[] {
  return predictions.map((pred) => {
    const tipResult = getTipScore(pred.tip);
    const teamResult = getTeamScore(pred.homeTeam, pred.awayTeam, pred.tip);
    const leagueResult = getLeagueScore(pred.league);

    const totalScore = tipResult.score + teamResult.score + leagueResult.score;
    const allReasons = [leagueResult.reason, tipResult.reason, teamResult.reason].filter(Boolean);

    return {
      ...pred,
      confidenceScore: totalScore,
      reasoning: allReasons.join(" ⚡ "),
    };
  });
}

export function selectTopPicks(scored: ScoredPrediction[], count: number = 2): ScoredPrediction[] {
  // فقط بازی‌هایی که هنوز شروع نشده‌اند
  const upcoming = scored.filter((prediction) => isUpcomingMatch(prediction));

  // سپس بر اساس امتیاز اطمینان مرتب می‌کنیم
  const sorted = [...upcoming].sort(
    (a, b) => b.confidenceScore - a.confidenceScore
  );

  // حداکثر دو بازی آینده را انتخاب می‌کنیم
  return sorted.slice(0, count);
}

export function parsePredictions(html: string): RawPrediction[] {
  const $ = cheerio.load(html);
  const predictions: RawPrediction[] = [];

  // Get all text content
  const bodyText = $("body").text();
  
  // Also try to get from specific content areas
  const contentAreas = [
    $(".entry-content").html(),
    $(".post-content").html(),
    $("article").html(),
    $(".page").html(),
    $("body").html(),
  ];

  let fullText = "";
  for (const area of contentAreas) {
    if (area) {
      fullText = area;
      break;
    }
  }

  // Parse match lines - format: "YYYY-MM-DD HH:MM\nLeague\nTeam1 vs Team2 – Tip"
  const textContent = cheerio.load(fullText || "").text();

  // Try to match patterns like:
  // 2026-08-28 20:15
  // Portugal Primeira Liga
  // Rio Ave FC vs Sporting Lisbon – 2
  const dateRegex = /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/g;
  const lines = textContent.split("\n").map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const dateMatch = lines[i].match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
    if (dateMatch && i + 2 < lines.length) {
      const matchDate = dateMatch[1];
      const matchTime = dateMatch[2];
      const league = lines[i + 1]?.trim();
      const matchLine = lines[i + 2]?.trim();

      if (league && matchLine) {
        // Parse "Team1 vs Team2 – Tip" or "Team1 vs Team2 - Tip"
        const matchParts = matchLine.split(/\s*[–—-]\s*/);
        if (matchParts.length >= 2) {
          const teamsPart = matchParts[0].trim();
          const tip = matchParts.slice(1).join(" – ").trim();

          const teams = teamsPart.split(/\s+vs\s+/i);
          if (teams.length === 2) {
            predictions.push({
              matchDate,
              matchTime,
              league,
              homeTeam: teams[0].trim(),
              awayTeam: teams[1].trim(),
              tip,
            });
          }
        }
      }
    }
  }

  return predictions;
}

export async function scrapeFromWebsite(): Promise<RawPrediction[]> {
  const response = await fetch("https://allnigeriafootball.com/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const html = await response.text();
  return parsePredictions(html);
}
