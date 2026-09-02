export interface SourcePrediction {
  source: string;
  tip: string;
  sourceWeight?: number;
}

export interface ConsensusInput {
  matchDate: string;
  matchTime: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  predictions: SourcePrediction[];
}

export interface ConsensusResult {
  consensusTip: string;
  confidenceScore: number;
  agreementCount: number;
  sourceCount: number;
  agreementPercent: number;
  reasoning: string;
}

function normalizeTip(tip: string): string {
  const t = tip
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  if (t === "1" || t.includes("home win")) return "1";
  if (t === "2" || t.includes("away win")) return "2";
  if (t === "x" || t === "draw") return "x";

  if (t === "1x" || t.includes("home or draw")) return "1x";
  if (t === "x2" || t.includes("away or draw")) return "x2";
  if (t === "12") return "12";

  if (t.includes("draw no bet")) {
    if (t.includes("home")) return "DNB1";
    if (t.includes("away")) return "DNB2";
    if (t.includes("1")) return "DNB1";
    if (t.includes("2")) return "DNB2";
  }

  const over = t.match(/over\s*(\d+(?:\.\d+)?)/);
  if (over) return `OVER_${over[1]}`;

  const under = t.match(/under\s*(\d+(?:\.\d+)?)/);
  if (under) return `UNDER_${under[1]}`;

  if (t === "gg" || t === "btts yes") return "BTTS_YES";
  if (t === "ng" || t === "btts no") return "BTTS_NO";

  return t;
}

function tipFamily(tip: string): string {
  if (tip === "1" || tip === "DNB1" || tip === "1x") return "HOME";
  if (tip === "2" || tip === "DNB2" || tip === "x2") return "AWAY";
  if (tip === "x") return "DRAW";

  if (tip.startsWith("OVER_")) return "OVER";
  if (tip.startsWith("UNDER_")) return "UNDER";

  if (tip === "BTTS_YES") return "BTTS_YES";
  if (tip === "BTTS_NO") return "BTTS_NO";

  return tip;
}

function calculateAgreement(predictions: SourcePrediction[]) {
  const groups = new Map<
    string,
    {
      count: number;
      weight: number;
      sources: string[];
      tips: string[];
    }
  >();

  for (const prediction of predictions) {
    const normalized = normalizeTip(prediction.tip);
    const family = tipFamily(normalized);

    const weight =
      typeof prediction.sourceWeight === "number"
        ? prediction.sourceWeight
        : 1;

    const current = groups.get(family) ?? {
      count: 0,
      weight: 0,
      sources: [],
      tips: [],
    };

    current.count += 1;
    current.weight += weight;
    current.sources.push(prediction.source);
    current.tips.push(prediction.tip);

    groups.set(family, current);
  }

  return [...groups.entries()].sort((a, b) => {
    if (b[1].weight !== a[1].weight) {
      return b[1].weight - a[1].weight;
    }

    return b[1].count - a[1].count;
  });
}

export function calculateConsensus(
  input: ConsensusInput
): ConsensusResult {
  const validPredictions = input.predictions.filter(
    (p) => p.source && p.tip
  );

  if (validPredictions.length === 0) {
    return {
      consensusTip: "",
      confidenceScore: 0,
      agreementCount: 0,
      sourceCount: 0,
      agreementPercent: 0,
      reasoning: "هیچ پیش‌بینی معتبری از منابع دریافت نشد",
    };
  }

  const groups = calculateAgreement(validPredictions);

  const winner = groups[0];
  const winningFamily = winner[0];
  const winningGroup = winner[1];

  const sourceCount = validPredictions.length;
  const agreementCount = winningGroup.count;

  const agreementPercent =
    (agreementCount / sourceCount) * 100;

  /*
   * سیستم امتیازدهی جدید
   *
   * 40 امتیاز = میزان توافق
   * 25 امتیاز = تعداد منابع مستقل
   * 20 امتیاز = قدرت برتری گروه بر مخالف
   * 15 امتیاز = پاداش اجماع کامل
   *
   * این امتیاز احتمال برد قطعی نیست.
   */

  const agreementScore = Math.min(
    40,
    agreementPercent * 0.4
  );

  const sourceScore = Math.min(
    25,
    sourceCount * 4
  );

  const secondGroupWeight =
    groups[1]?.[1].weight ?? 0;

  const totalCompetingWeight =
    winningGroup.weight + secondGroupWeight;

  const dominance =
    totalCompetingWeight > 0
      ? winningGroup.weight / totalCompetingWeight
      : 1;

  const dominanceScore = dominance * 20;

  const fullConsensusBonus =
    agreementCount === sourceCount
      ? sourceCount >= 3
        ? 15
        : 8
      : 0;

  let confidenceScore = Math.round(
    agreementScore +
      sourceScore +
      dominanceScore +
      fullConsensusBonus
  );

  confidenceScore = Math.max(
    0,
    Math.min(100, confidenceScore)
  );

  const representative =
    validPredictions.find(
      (p) =>
        tipFamily(normalizeTip(p.tip)) ===
        winningFamily
    ) ?? validPredictions[0];

  const sourceNames =
    winningGroup.sources.join(", ");

  const reasoning =
    `اجماع ${agreementCount} از ${sourceCount} منبع ` +
    `(${Math.round(agreementPercent)}٪) ` +
    `⚡ منابع موافق: ${sourceNames} ` +
    `⚡ قدرت اجماع: ${Math.round(dominance * 100)}٪ ` +
    `⚡ امتیاز اجماع: ${confidenceScore}/100`;

  return {
    consensusTip: representative.tip,
    confidenceScore,
    agreementCount,
    sourceCount,
    agreementPercent:
      Math.round(agreementPercent * 10) / 10,
    reasoning,
  };
}
