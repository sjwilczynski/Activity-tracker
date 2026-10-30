import { describe, expect, it } from "vitest";
import type { ActivitySummaries, CategoryOption } from "@/data/types";
import { getActivityPoints, getDistributionRings } from "./activity-chart-data";

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

describe.each([true, false])("activity chart data (grouped=%s)", (grouped) => {
  it("reconciles all rings and retains the chosen proportions", () => {
    const points = getActivityPoints(summaries, summaries, categories, grouped);
    const rings = getDistributionRings(points, summaries, categories, grouped);
    expect(rings).toHaveLength(grouped ? 3 : 2);
    expect(
      rings.map((ring) =>
        ring.slices.reduce((sum, slice) => sum + slice.count, 0)
      )
    ).toEqual(grouped ? [13, 13, 13] : [13, 13]);
    expect(rings[0].slices.map((slice) => slice.name)).toEqual(
      points.map((point) => point.name)
    );
    expect(rings[0].outer).toBe(1);
    expect(rings[0].inner).toBeCloseTo(grouped ? 0.5 : 0.3 / 1.3);
    expect(rings.at(-1)?.inner).toBe(0);
    expect(rings.at(-1)?.slices.map((slice) => slice.count)).toEqual([11, 2]);
    if (grouped)
      expect(rings[1].slices).toMatchObject([
        { name: "Sports", count: 10 },
        { name: "Learning", count: 2 },
        { name: "other", count: 1 },
      ]);
  });
  it("keeps activity colors stable when dates or inactive visibility change", () => {
    const before = getActivityPoints(summaries, summaries, categories, grouped);
    const after = getActivityPoints(
      { Cycling: { count: 1, active: true } },
      summaries,
      categories,
      grouped
    );
    expect(after[0].color).toBe(
      before.find((point) => point.name === "Cycling")?.color
    );
  });
});

it("recomputes every ring from the visible activities", () => {
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
  expect(rings[1].slices.find((slice) => slice.name === "Sports")?.count).toBe(
    4
  );
});

it("supports empty and inactive-only selections without zero-size status slices", () => {
  expect(getActivityPoints({}, summaries, categories, true)).toEqual([]);
  const points = getActivityPoints(
    { Reading: summaries.Reading },
    summaries,
    categories,
    true
  );
  expect(
    getDistributionRings(points, summaries, categories, true).at(-1)?.slices
  ).toMatchObject([{ name: "Inactive", count: 2 }]);
  expect(
    getDistributionRings([], summaries, categories, true).every(
      (ring) => !ring.slices.length
    )
  ).toBe(true);
});

it("preserves exact activity-name identities across different categories", () => {
  const values = {
    Run: { count: 2, active: true },
    run: { count: 1, active: false },
  };
  const options = [
    { name: "Run", categoryName: "A", categoryId: "a", active: true },
    { name: "run", categoryName: "B", categoryId: "b", active: false },
  ];
  expect(
    getActivityPoints(values, values, options, true).map((point) => [
      point.name,
      point.category,
    ])
  ).toEqual([
    ["Run", "A"],
    ["run", "B"],
  ]);
});
