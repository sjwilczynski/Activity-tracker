import { describe, expect, it } from "vitest";
import type { ActivityRecordWithId } from "@/data/types";
import { periodsFromParams } from "./compare-utils";
import { getComparisonBuckets, getComparisonSeries } from "./comparison-data";

const asOf = new Date(2026, 9, 24);
const record = (date: Date, active = true): ActivityRecordWithId => ({
  id: String(date.getTime()),
  name: "A custom activity",
  categoryId: "custom",
  active,
  date,
});

it("marks partial periods and preserves the full shared domain regardless of order", () => {
  const series = getComparisonSeries(
    [],
    periodsFromParams("year-2026,year-2025"),
    asOf
  );
  expect(series.map((entry) => [entry.name, entry.points.length])).toEqual([
    ["2026 (partial)", 10],
    ["2025", 12],
  ]);
  expect(getComparisonBuckets(series)).toHaveLength(12);
  expect(getComparisonBuckets(series).at(-1)).toBe("Dec");
  expect(getComparisonBuckets(series)).toEqual(
    getComparisonBuckets(series.toReversed())
  );
});

it("omits future buckets, but retains genuinely empty observed buckets", () => {
  const series = getComparisonSeries(
    [
      record(new Date(2026, 9, 3)),
      record(new Date(2026, 11, 1)),
      record(new Date(2026, 9, 4), false),
    ],
    periodsFromParams("year-2026,year-2027"),
    asOf
  );
  expect(series[0].points.reduce((sum, point) => sum + point.count, 0)).toBe(1);
  expect(series[0].points[0]).toEqual({ bucket: "Jan", count: 0 });
  expect(series[1]).toMatchObject({
    name: "2027 (not started)",
    upcoming: true,
    partial: false,
    points: [],
  });
});

it("keeps the existing five-week aggregation and identifies partial months", () => {
  const records = [record(new Date(2026, 9, 1)), record(new Date(2026, 8, 30))];
  const series = getComparisonSeries(
    records,
    periodsFromParams("month-2026-9,month-2026-8"),
    asOf
  );
  expect(series.map((entry) => entry.points.length)).toEqual([4, 5]);
  expect(series[0].name).toBe("October 2026 (partial)");
  expect(series[1].points.at(-1)?.count).toBe(1);
});

it("marks late December and fifth-week current months as partial", () => {
  const series = getComparisonSeries(
    [],
    periodsFromParams("year-2026,month-2026-11"),
    new Date(2026, 11, 30)
  );
  expect(series.map((entry) => entry.partial)).toEqual([true, true]);
  expect(series.map((entry) => entry.points.length)).toEqual([12, 5]);
});

describe.each([
  new Date(2024, 1, 29),
  new Date(2025, 0, 1),
  new Date(2026, 11, 31),
])("cutoff %s", (cutoff) => {
  it("includes today's entries, not tomorrow's", () => {
    const tomorrow = new Date(
      cutoff.getFullYear(),
      cutoff.getMonth(),
      cutoff.getDate() + 1
    );
    const series = getComparisonSeries(
      [record(cutoff), record(tomorrow)],
      periodsFromParams(`year-${cutoff.getFullYear()}`),
      cutoff
    );
    expect(series[0].points.reduce((sum, point) => sum + point.count, 0)).toBe(
      1
    );
  });
});

it("deduplicates and caps URL periods so chart mark IDs remain unique", () => {
  expect(
    periodsFromParams("year-2024,year-2024,invalid,year-2023")
  ).toHaveLength(2);
  expect(
    periodsFromParams(
      Array.from({ length: 10 }, (_, index) => `year-${2020 + index}`).join(",")
    )
  ).toHaveLength(7);
});
