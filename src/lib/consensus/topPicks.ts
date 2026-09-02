import type { ConsensusMatch } from "./buildConsensus";

export function selectConsensusTopPicks(
  matches: ConsensusMatch[],
  limit = 2
): ConsensusMatch[] {
  return matches
    .filter(
      (match) =>
        match.sourceCount >= 2 &&
        match.agreementPercent >= 67 &&
        match.confidenceScore >= 70
    )
    .sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }

      if (b.agreementPercent !== a.agreementPercent) {
        return b.agreementPercent - a.agreementPercent;
      }

      if (b.sourceCount !== a.sourceCount) {
        return b.sourceCount - a.sourceCount;
      }

      return b.agreementCount - a.agreementCount;
    })
    .slice(0, limit);
}
