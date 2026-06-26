import type { HeatmapLevel } from "./weekly-heatmap-data";

/**
 * Explicit 5-step shade ramp built from theme tokens (NOT opacity), so the
 * heatmap stays legible in both light and dark themes. Level 0 uses the muted
 * token to read clearly as "empty" and stay distinct from level 1.
 *
 * `color-mix` against `--color-background` keeps each step anchored to the
 * current theme's surface, so the ramp re-themes automatically.
 */
const LEVEL_BACKGROUND: Record<HeatmapLevel, string> = {
  0: "var(--color-muted)",
  1: "color-mix(in oklab, var(--color-primary) 28%, var(--color-background))",
  2: "color-mix(in oklab, var(--color-primary) 50%, var(--color-background))",
  3: "color-mix(in oklab, var(--color-primary) 72%, var(--color-background))",
  4: "var(--color-primary)",
};

export function levelBackground(level: HeatmapLevel): string {
  return LEVEL_BACKGROUND[level];
}

export const HEATMAP_LEVELS: HeatmapLevel[] = [0, 1, 2, 3, 4];
