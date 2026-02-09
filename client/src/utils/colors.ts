/**
 * Activity color utilities.
 * Provides per-activity hash-based colors, category-to-color mapping,
 * and HSL variant functions. Seed palette from --chart-1 through --chart-5.
 */

const ACTIVITY_COLORS: Record<string, string> = {
  jogging: "#D4764E",
  swimming: "#5085BE",
  cycling: "#1E7A4E",
  football: "#CD6078",
  yoga: "#D4A03C",
  hiking: "#5BA37C",
  basketball: "#8b5cf6",
  tennis: "#06b6d4",
  sick: "#8b7ea3",
};

const FALLBACK_COLOR = "#94a3b8";

const SEED_PALETTE = [
  "#D4764E", // --chart-1
  "#5085BE", // --chart-2
  "#1E7A4E", // --chart-3
  "#D4A03C", // --chart-4
  "#CD6078", // --chart-5
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

/** Get a color for an activity name, using known mapping or hash fallback. */
export function getActivityColor(activityName: string): string {
  const normalized = activityName.toLowerCase().trim();
  if (normalized in ACTIVITY_COLORS) {
    return ACTIVITY_COLORS[normalized];
  }
  const index = hashString(normalized) % SEED_PALETTE.length;
  return SEED_PALETTE[index];
}

/** Get a color for a category name using hash-based selection. */
export function getCategoryColor(categoryName: string): string {
  const index =
    hashString(categoryName.toLowerCase().trim()) % SEED_PALETTE.length;
  return SEED_PALETTE[index];
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Return a lighter variant of a hex color. */
export function lightenColor(hex: string, amount = 15): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, s, Math.min(100, l + amount));
}

/** Return a darker variant of a hex color. */
export function darkenColor(hex: string, amount = 15): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

/** Return a color with reduced opacity as an rgba string. */
export function withOpacity(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export { ACTIVITY_COLORS, FALLBACK_COLOR, SEED_PALETTE };
