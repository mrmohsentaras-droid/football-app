import type { SourceMatch } from "@/lib/sources/allNigeria";
import { calculateConsensus } from "./engine";
import { matchesSameGame } from "./matcher";

export interface ConsensusMatch {
  date: string;
  time: string;
  league: string;
  home: string;
  away: string;
  consensusTip: string;
  confidenceScore: number;
  agreementCount: number;
  sourceCount: number;
  agreementPercent: number;
  reasoning: string;
}

export function buildConsensus(
  allNigeria: SourceMatch[],
  statarea: SourceMatch[],
  soccerVista: SourceMatch[],
  sportsMole: SourceMatch[]
): ConsensusMatch[] {
  const allSources: SourceMatch[] = [
    ...allNigeria,
    ...statarea,
    ...soccerVista,
    ...sportsMole,
  ];

  // گروه‌بندی بازی‌های یکسان با استفاده از matcher
  // تا تفاوت‌هایی مثل:
  // CR Flamengo / Flamengo
  // Falkirk FC / Falkirk
  // باعث ایجاد بازی تکراری نشوند.
  const groups: SourceMatch[][] = [];

  for (const match of allSources) {
    let group = groups.find((existing) =>
      matchesSameGame(existing[0], match)
    );

    if (!group) {
      group = [];
      groups.push(group);
    }

    // از هر منبع فقط یک رکورد برای هر بازی نگه می‌داریم
    const alreadyFromSource = group.some(
      (existing) => existing.source === match.source
    );

    if (!alreadyFromSource) {
      group.push(match);
    }
  }

  const results: ConsensusMatch[] = [];

  for (const sourceMatches of groups) {
    // برای اجماع معتبر حداقل ۲ منبع لازم است
    if (sourceMatches.length < 2) continue;

    const base = sourceMatches[0];

    const predictions = sourceMatches.map((match) => ({
      source: match.source,
      tip: match.tip,
      sourceWeight: 1,
    }));

    const consensus = calculateConsensus({
      matchDate: base.date,
      matchTime: base.time,
      league: sourceMatches.find((m) => m.league)?.league || "",
      homeTeam: base.home,
      awayTeam: base.away,
      predictions,
    });

    results.push({
      date: base.date,
      time: base.time,
      league: sourceMatches.find((m) => m.league)?.league || "",
      home: base.home,
      away: base.away,
      consensusTip: consensus.consensusTip,
      confidenceScore: consensus.confidenceScore,
      agreementCount: consensus.agreementCount,
      sourceCount: consensus.sourceCount,
      agreementPercent: consensus.agreementPercent,
      reasoning: consensus.reasoning,
    });
  }

  return results.sort(
    (a, b) => b.confidenceScore - a.confidenceScore
  );
}
