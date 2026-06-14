import { defaultFilter } from "cmdk";

/**
 * Fuzzy filter for the cmdk Command component.
 *
 * cmdk's own `defaultFilter` (the `command-score` algorithm) already handles
 * exact, prefix, word-boundary and in-order subsequence ("abbreviation")
 * matches, and ranks them with useful, nuanced scores. We keep all of that and
 * only add what it lacks: tolerance for typos that break its in-order matching,
 * such as substitutions ("Runninh" → "Running") where the default returns 0.
 *
 * Strategy:
 *   1. Defer to `defaultFilter`. If it matches (> 0), return its score so the
 *      built-in ranking is preserved.
 *   2. Otherwise fall back to a bounded edit-distance check and return a flat
 *      score for plausible typo matches.
 *
 * Edit-distance thresholds scale with query length so short queries stay
 * precise (a 1-edit window on a 2-char query would match almost anything):
 *   length < 3  → 0 errors allowed (typo fallback disabled)
 *   length 3–5  → 1 error allowed
 *   length ≥ 6  → 2 errors allowed
 *
 * Compatible with cmdk's `filter` prop: `(value, search, keywords?) => number`.
 */
export function fuzzyFilter(
  value: string,
  search: string,
  keywords?: string[]
): number {
  if (search.length === 0) return 1;

  const baseScore = defaultFilter(value, search, keywords);
  if (baseScore > 0) return baseScore;

  return typoToleranceScore(value, search);
}

/** Score (0.5) for queries within the allowed edit distance, else 0. */
function typoToleranceScore(value: string, search: string): number {
  const srch = search.toLowerCase();
  const maxErrors = srch.length < 3 ? 0 : srch.length < 6 ? 1 : 2;
  if (maxErrors === 0) return 0;

  return minEditDistanceInSubstring(value.toLowerCase(), srch) <= maxErrors
    ? 0.5
    : 0;
}

/**
 * Returns the minimum edit distance between `pattern` and any substring of
 * `text` (insertions, deletions, substitutions each cost 1).
 *
 * Setting `dp[0][j] = 0` gives "free" alignment to any starting position in
 * `text`, making this a fuzzy substring search rather than a full-string
 * comparison.
 */
function minEditDistanceInSubstring(text: string, pattern: string): number {
  const m = pattern.length;
  const n = text.length;

  // prev[i] = edit distance for pattern[0..i-1] aligned up to previous text col
  const prev = Array.from({ length: m + 1 }, (_, i) => i);
  const curr = new Array<number>(m + 1).fill(0);
  let minDist = m;

  for (let j = 1; j <= n; j++) {
    curr[0] = 0; // free to start the pattern anywhere in text
    for (let i = 1; i <= m; i++) {
      curr[i] =
        pattern[i - 1] === text[j - 1]
          ? prev[i - 1]
          : 1 + Math.min(prev[i - 1], prev[i], curr[i - 1]);
    }
    if (curr[m] < minDist) minDist = curr[m];
    for (let i = 0; i <= m; i++) prev[i] = curr[i];
  }

  return minDist;
}
