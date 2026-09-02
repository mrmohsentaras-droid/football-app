export function getTopPicks(predictions: any[], limit = 2) {
  return predictions
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit)
    .map((pick, index) => ({
      ...pick,
      rank: index + 1
    }));
}
