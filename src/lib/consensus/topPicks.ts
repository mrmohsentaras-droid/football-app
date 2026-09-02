import type { ConsensusMatch } from "./buildConsensus";

export function selectConsensusTopPicks(
  matches: ConsensusMatch[],
  limit = 2
): ConsensusMatch[] {
  const qualified = matches
    .filter((match) => {
      if (match.sourceCount < 2) return false;
      if (match.agreementPercent < 67) return false;
      if (match.confidenceScore < 70) return false;

      if (
        match.sourceCount === 2 &&
        match.agreementCount !== 2
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }

      if (b.agreementPercent !== a.agreementPercent) {
        return b.agreementPercent - a.agreementPercent;
      }

      return b.sourceCount - a.sourceCount;
    });

  if (qualified.length >= limit) {
    return qualified.slice(0, limit);
  }

  const selected = [...qualified];

  const remaining = matches
    .filter((match) => !selected.includes(match))
    .sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }

      if (b.agreementPercent !== a.agreementPercent) {
        return b.agreementPercent - a.agreementPercent;
      }

      return b.sourceCount - a.sourceCount;
    });

  for (const match of remaining) {
    if (selected.length >= limit) break;
    selected.push(match);
  }

  return selected;
}
