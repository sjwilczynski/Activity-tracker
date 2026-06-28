import type { CSSProperties } from "react";
import type { HeatmapLevel } from "./weekly-heatmap-data";

/** Inline style for a single heatmap cell at a given level. */
export type LevelStyle = Pick<CSSProperties, "backgroundColor" | "border">;

const mix = (pct: number) =>
  `color-mix(in oklab, var(--color-primary) ${pct}%, var(--color-background))`;

/**
 * Explicit 5-step treatment (NOT opacity), so the heatmap stays legible in both
 * light and dark themes and for colour-blind users.
 *
 * Empty weeks (level 0) render as a HOLLOW cell — transparent fill with a
 * border ring — so they read clearly as "nothing logged" and stay obviously
 * distinct from level 1. The ring is a `border`, NOT an inline `box-shadow`:
 * the cell's keyboard focus indicator is a Tailwind `focus-visible:ring-*`
 * (also box-shadow based), and an inline box-shadow would override it, hiding
 * the focus ring on empty cells. Active levels use a raised-floor primary ramp
 * (level 1 starts at a substantial 42% mix, not near-background) climbing to
 * the solid primary token, so even one active activity is unmistakable.
 */
const LEVEL_STYLES: Record<HeatmapLevel, LevelStyle> = {
  0: {
    backgroundColor: "transparent",
    border: "1.5px solid var(--color-border)",
  },
  1: { backgroundColor: mix(42) },
  2: { backgroundColor: mix(60) },
  3: { backgroundColor: mix(80) },
  4: { backgroundColor: "var(--color-primary)" },
};

export function levelStyle(level: HeatmapLevel): LevelStyle {
  return LEVEL_STYLES[level];
}

export const HEATMAP_LEVELS: HeatmapLevel[] = [0, 1, 2, 3, 4];
