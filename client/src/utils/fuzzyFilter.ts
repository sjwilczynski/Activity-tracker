/**
 * Fuzzy filter for cmdk Command component.
 *
 * Returns a score > 0 when the search characters appear in `value` in order
 * (not necessarily consecutively), enabling "fuzzy" matching beyond exact
 * substrings.  Returns 0 when there is no match.
 *
 * Scoring:
 *   1.0 – exact substring match (highest relevance)
 *   0.5 – all search characters appear in value in order (fuzzy match)
 *
 * Compatible with cmdk's `filter` prop: `(value, search) => number`.
 */
export function fuzzyFilter(value: string, search: string): number {
  if (search.length === 0) return 1;

  const val = value.toLowerCase();
  const srch = search.toLowerCase();

  if (val.includes(srch)) {
    return 1;
  }

  // Check that every character in `srch` appears in `val` in order
  let searchIdx = 0;
  for (let i = 0; i < val.length && searchIdx < srch.length; i++) {
    if (val[i] === srch[searchIdx]) {
      searchIdx++;
    }
  }

  if (searchIdx === srch.length) {
    return 0.5;
  }

  return 0;
}
