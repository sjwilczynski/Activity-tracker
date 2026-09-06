import { describe, expect, it } from "vitest";
import { HEATMAP_LEVELS, levelStyle } from "./heatmap-colors";

describe("levelStyle", () => {
  it("renders an empty week (level 0) as a hollow, transparent cell with a border ring", () => {
    const style = levelStyle(0);
    expect(style.backgroundColor).toBe("transparent");
    // A visible border outline is what makes empty weeks distinct from level 1.
    // It is deliberately a `border`, not an inline box-shadow: the cell's
    // Tailwind focus-visible:ring-* is box-shadow based, so an inline box-shadow
    // would override it and hide the keyboard focus ring on empty cells. The
    // LevelStyle type (no `boxShadow` member) enforces this at compile time.
    expect(style.border).toMatch(/var\(--color-border\)/);
  });

  it("fills active levels with the theme primary (no transparency)", () => {
    for (const level of [1, 2, 3, 4] as const) {
      const style = levelStyle(level);
      expect(style.backgroundColor).not.toBe("transparent");
      expect(style.backgroundColor).toContain("var(--color-primary)");
    }
  });

  it("uses a raised floor so level 1 is clearly coloured, ramping up to solid primary", () => {
    // Level 1 must be a substantial mix (raised floor), not near-background.
    const one = String(levelStyle(1).backgroundColor);
    const floor = Number(one.match(/(\d+)%/)?.[1]);
    expect(floor).toBeGreaterThanOrEqual(40);

    // Top of the ramp is the solid primary token.
    expect(levelStyle(4).backgroundColor).toBe("var(--color-primary)");
  });

  it("increases intensity monotonically from level 1 to 4", () => {
    const pct = (level: 1 | 2 | 3 | 4) =>
      Number(
        String(levelStyle(level).backgroundColor).match(/(\d+)%/)?.[1] ?? 100
      );
    expect(pct(1)).toBeLessThan(pct(2));
    expect(pct(2)).toBeLessThan(pct(3));
    expect(pct(3)).toBeLessThan(pct(4));
  });

  it("exposes all five levels in order for the legend", () => {
    expect(HEATMAP_LEVELS).toEqual([0, 1, 2, 3, 4]);
  });
});
