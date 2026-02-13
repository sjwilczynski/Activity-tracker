/**
 * Activity color utilities.
 * Provides per-activity hash-based colors using a well-spaced palette.
 */

const COLOR_PALETTE = [
  "#D4764E", // warm orange
  "#5085BE", // blue
  "#1E7A4E", // green
  "#D4A03C", // gold
  "#CD6078", // rose
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#e84393", // pink
  "#2ecc40", // lime
  "#fd79a8", // coral
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Get a deterministic color for any activity name via hash. */
export function getActivityColor(activityName: string): string {
  const index =
    hashString(activityName.toLowerCase().trim()) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}
