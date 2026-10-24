import { describe, expect, it } from "vitest";
import {
  getStackedBarChartData,
  getFlatBarChartData,
} from "@/components/visualization/bar-chart-data";
import {
  getPieChartData,
  getFlatPieChartData,
} from "@/components/visualization/pie-chart-data";
import type { ActivitySummaries, CategoryOption } from "@/data";
import { periodsFromParams } from "../compare-utils";
import {
  getActivityPoints,
  getCategorySlices,
  getComparisonSeries,
  getDistributionRings,
} from "./chart-model";

const summaries: ActivitySummaries = {
  Running: { count: 6, active: true },
  Cycling: { count: 4, active: true },
  Reading: { count: 2, active: false },
  Unmapped: { count: 1, active: true },
};
const categories: CategoryOption[] = [
  {
    name: "Running",
    categoryName: "Sports",
    categoryId: "sports",
    active: true,
  },
  {
    name: "Cycling",
    categoryName: "Sports",
    categoryId: "sports",
    active: true,
  },
  {
    name: "Reading",
    categoryName: "Learning",
    categoryId: "learning",
    active: false,
  },
];

describe.each([true, false])("TanStack model parity, grouped=%s", (grouped) => {
  it("preserves every pie ring's counts, colors, and weights", () => {
    const points = getActivityPoints(summaries, summaries, categories, grouped);
    const rings = getDistributionRings(points, summaries, categories, grouped);
    const existing = grouped
      ? getPieChartData(summaries, summaries, categories)
      : getFlatPieChartData(summaries);
    expect(rings).toHaveLength(existing.datasets.length);
    rings.forEach((ring, index) => {
      expect(ring.slices.map((slice) => slice.count)).toEqual(
        existing.datasets[index].data
      );
      expect(ring.slices.map((slice) => slice.color)).toEqual(
        existing.datasets[index].backgroundColor
      );
      expect(ring.slices.reduce((sum, slice) => sum + slice.count, 0)).toBe(13);
    });
    expect(rings[0].outer).toBe(1);
    expect(rings.at(-1)?.inner).toBe(0);
    expect(rings[0].inner).toBeCloseTo(grouped ? 0.5 : 0.3 / 1.3);
  });

  it("preserves frequency bar values and stable colors after filtering", () => {
    const filtered = { ...summaries, Running: { count: 3, active: true } };
    const points = getActivityPoints(filtered, summaries, categories, grouped);
    const existing = grouped
      ? getStackedBarChartData(filtered, summaries, categories)
      : getFlatBarChartData(filtered, summaries);
    expect(points.reduce((sum, point) => sum + point.count, 0)).toBe(10);
    if (grouped) {
      expect([...new Set(points.map((point) => point.category))]).toEqual(
        existing.labels
      );
      points.forEach((point) => {
        const dataset = existing.datasets.find(
          (entry) => entry.label === point.name
        );
        expect(point.color).toBe(dataset?.backgroundColor);
      });
    } else {
      expect(points.map((point) => point.name)).toEqual(existing.labels);
      expect(points.map((point) => point.count)).toEqual(
        existing.datasets[0].data
      );
      expect(points.map((point) => point.color)).toEqual(
        existing.datasets[0].backgroundColor
      );
    }
  });
});

it("reconciles every ring after hiding an activity instead of hiding unrelated indexes", () => {
  const points = getActivityPoints(
    summaries,
    summaries,
    categories,
    true
  ).filter((point) => point.name !== "Running");
  const rings = getDistributionRings(points, summaries, categories, true);
  expect(
    rings.map((ring) =>
      ring.slices.reduce((sum, slice) => sum + slice.count, 0)
    )
  ).toEqual([7, 7, 7]);
  expect(
    getCategorySlices(points, summaries, categories).find(
      (slice) => slice.name === "Sports"
    )?.count
  ).toBe(4);
});

it("omits empty data and retains a single inactive category without invalid percentages", () => {
  expect(getActivityPoints({}, summaries, categories, true)).toEqual([]);
  const points = getActivityPoints(
    { Reading: summaries.Reading },
    summaries,
    categories,
    true
  );
  const rings = getDistributionRings(points, summaries, categories, true);
  expect(
    rings.every(
      (ring) => ring.slices.reduce((sum, slice) => sum + slice.count, 0) === 2
    )
  ).toBe(true);
});

it("distinguishes future buckets from zero counts only in the clarity variant", () => {
  const periods = periodsFromParams("year-2025,year-2026");
  expect(
    getComparisonSeries([], periods).map((series) => series.points.length)
  ).toEqual([12, 12]);
  const clipped = getComparisonSeries([], periods, new Date(2026, 9, 24));
  expect(clipped.map((series) => series.points.length)).toEqual([12, 10]);
  expect(clipped[1].name).toBe("2026 (partial)");
  expect(clipped[1].points.every((point) => point.count === 0)).toBe(true);
});

it("omits only future weeks for an incomplete month, leaving earlier months intact", () => {
  const series = getComparisonSeries(
    [],
    periodsFromParams("month-2026-8,month-2026-9"),
    new Date(2026, 9, 24)
  );
  expect(series.map((entry) => entry.points.length)).toEqual([5, 4]);
  expect(series[0].name).toBe("September 2026");
  expect(series[1].name).toBe("October 2026 (partial)");
});
