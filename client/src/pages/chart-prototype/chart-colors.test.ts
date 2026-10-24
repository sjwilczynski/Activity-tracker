import { expect, it } from "vitest";
import { accessiblePlotColors } from "./chart-colors";

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

it.each([
  [true, "#fefdfb"],
  [false, "#1e2942"],
] as const)(
  "keeps every clarity series above 3:1 against its chart background (light=%s)",
  (light, background) => {
    for (const color of accessiblePlotColors(light)) {
      const values = [luminance(color), luminance(background)].sort(
        (a, b) => a - b
      );
      expect(
        (values[1] + 0.05) / (values[0] + 0.05),
        color
      ).toBeGreaterThanOrEqual(3);
    }
  }
);
