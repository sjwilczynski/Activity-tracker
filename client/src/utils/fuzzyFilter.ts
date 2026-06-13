/**
 * Fuzzy filter for cmdk Command component.
 *
 * Returns a score > 0 when the search is a plausible match for `value`,
 * handling both typos and non-contiguous abbreviations.
 *
 * Scoring:
 *   1.0 – exact substring match
 *   0.8 – typo-tolerant match (edit distance ≤ threshold within any substring)
 *   0.5 – all search characters appear in value in order (abbreviation match)
 *   0   – no match (item hidden)
 *
 * Typo thresholds (scales with query length so short queries stay precise):
 *   length < 3  → 0 errors allowed
 *   length 3–5  → 1 error allowed
 *   length ≥ 6  → 2 errors allowed
 *
 * Compatible with cmdk's `filter` prop: `(value, search) => number`.
 */
export function fuzzyFilter(value: string, search: string): number {
  if (search.length === 0) return 1;

  const val = value.toLowerCase();
  const srch = search.toLowerCase();

  // 1. Exact substring match
  if (val.includes(srch)) return 1;

  // 2. Typo-tolerant match using minimum edit distance over any substring
  const maxErrors = srch.length < 3 ? 0 : srch.length < 6 ? 1 : 2;
  if (maxErrors > 0 && minEditDistanceInSubstring(val, srch) <= maxErrors) {
    return 0.8;
  }

  // 3. Subsequence (in-order chars, useful for abbreviation-style queries)
  let si = 0;
  for (let i = 0; i < val.length && si < srch.length; i++) {
    if (val[i] === srch[si]) si++;
  }
  if (si === srch.length) return 0.5;

  return 0;
}

/**
 * Returns the minimum edit distance between `pattern` and any substring of
 * `text` (insertions, deletions, substitutions each cost 1).
 *
 * Setting `dp[j][0] = 0` gives "free" alignment to any starting position in
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
