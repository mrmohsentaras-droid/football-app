import type { ConsensusMatch } from "./buildConsensus";

export function selectConsensusTopPicks(
  matches: ConsensusMatch[],
  limit = 2
): ConsensusMatch[] {
  return matches
    .filter((match) => {
      // حداقل دو منبع مستقل
      if (match.sourceCount < 2) return false;

      // حداقل 67٪ توافق
      if (match.agreementPercent < 67) return false;

      // حداقل امتیاز اطمینان
      if (match.confidenceScore < 70) return false;

      // اگر فقط دو منبع داریم، هر دو باید موافق باشند
      if (
        match.sourceCount === 2 &&
        match.agreementCount !== 2
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // اول confidence
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }

      // سپس درصد توافق
      if (b.agreementPercent !== a.agreementPercent) {
        return b.agreementPercent - a.agreementPercent;
      }

      // سپس تعداد منابع
      if (b.sourceCount !== a.sourceCount) {
        return b.sourceCount - a.sourceCount;
      }

      // سپس تعداد منابع موافق
      return b.agreementCount - a.agreementCount;
    })
    .slice(0, limit);
}
