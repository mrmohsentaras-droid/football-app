import type { SourceMatch } from "@/lib/sources/allNigeria";

function normalizeTeam(team: string): string {
  return team
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’']/g, "")
    .replace(/\b(fc|afc|cf|sc|ac|fk|sv|sk|cd|cr)\b/g, "")
    .replace(/\b1899\b/g, "")
    .replace(/\butd\b/g, "united")
    .replace(/\s+/g, " ")
    .trim();
}

function teamTokens(team: string): string[] {
  return normalizeTeam(team)
    .split(" ")
    .filter(Boolean);
}

function teamsEquivalent(a: string, b: string): boolean {
  const na = normalizeTeam(a);
  const nb = normalizeTeam(b);

  if (na === nb) return true;

  const ta = teamTokens(a);
  const tb = teamTokens(b);

  if (ta.length === 0 || tb.length === 0) return false;

  const sa = [...ta].sort().join(" ");
  const sb = [...tb].sort().join(" ");

  if (sa === sb) return true;

  return (
    ta.every((token) => tb.includes(token)) ||
    tb.every((token) => ta.includes(token))
  );
}

export function matchesSameGame(
  a: SourceMatch,
  b: SourceMatch
): boolean {
  if (a.date !== b.date) return false;

  return (
    teamsEquivalent(a.home, b.home) &&
    teamsEquivalent(a.away, b.away)
  );
}
