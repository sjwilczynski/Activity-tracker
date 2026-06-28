import {
  addWeeks,
  getISOWeek,
  getISOWeekYear,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { describe, expect, it } from "vitest";
import {
  buildWeeklyHeatmap,
  getLevel,
  getMonthLabels,
  type HeatmapActivity,
} from "./weekly-heatmap-data";

/** Local-midday date avoids timezone edge flakiness. */
function localDay(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

function activity(date: Date, active = true): HeatmapActivity {
  return { date, active };
}

const MONDAY = { weekStartsOn: 1 } as const;

describe("getLevel", () => {
  it("buckets counts into 5 levels (0, 1-2, 3-4, 5-6, 7+)", () => {
    expect(getLevel(0)).toBe(0);
    expect(getLevel(1)).toBe(1);
    expect(getLevel(2)).toBe(1);
    expect(getLevel(3)).toBe(2);
    expect(getLevel(4)).toBe(2);
    expect(getLevel(5)).toBe(3);
    expect(getLevel(6)).toBe(3);
    expect(getLevel(7)).toBe(4);
    expect(getLevel(99)).toBe(4);
  });
});

describe("buildWeeklyHeatmap", () => {
  const endDate = localDay(2024, 5, 15); // Sat Jun 15 2024

  it("returns exactly `weeks` contiguous buckets ending at the week of endDate", () => {
    const buckets = buildWeeklyHeatmap([], { endDate, weeks: 52 });
    expect(buckets).toHaveLength(52);

    const lastWeekStart = startOfWeek(endDate, MONDAY);
    expect(buckets[51].weekStart.getTime()).toBe(lastWeekStart.getTime());
    expect(buckets[0].weekStart.getTime()).toBe(
      subWeeks(lastWeekStart, 51).getTime()
    );

    // Each bucket is exactly one week after the previous one.
    for (let i = 1; i < buckets.length; i++) {
      expect(buckets[i].weekStart.getTime()).toBe(
        addWeeks(buckets[i - 1].weekStart, 1).getTime()
      );
    }
  });

  it("honors a custom `weeks` window length", () => {
    expect(buildWeeklyHeatmap([], { endDate, weeks: 12 })).toHaveLength(12);
  });

  it("canonicalizes activities to their local Monday week and counts them", () => {
    // Sun Jun 9 2024 belongs to the week starting Mon Jun 3 2024,
    // while Mon Jun 10 2024 belongs to the latest week.
    const activities = [
      activity(localDay(2024, 5, 9)), // -> week of Jun 3
      activity(localDay(2024, 5, 10)), // -> week of Jun 10
      activity(localDay(2024, 5, 12)), // -> week of Jun 10
      activity(localDay(2024, 5, 15)), // -> week of Jun 10
    ];
    const buckets = buildWeeklyHeatmap(activities, { endDate, weeks: 52 });

    const latest = buckets[51];
    expect(latest.count).toBe(3);
    expect(latest.level).toBe(2); // 3 -> level 2

    const prev = buckets[50];
    expect(prev.weekStart.getTime()).toBe(
      startOfWeek(localDay(2024, 5, 3), MONDAY).getTime()
    );
    expect(prev.count).toBe(1);
    expect(prev.level).toBe(1);
  });

  it("keeps empty weeks present as count 0 / level 0 (no gaps)", () => {
    const buckets = buildWeeklyHeatmap([activity(endDate)], {
      endDate,
      weeks: 52,
    });
    const empty = buckets.filter((b) => b.count === 0);
    expect(empty).toHaveLength(51);
    empty.forEach((b) => expect(b.level).toBe(0));
  });

  it("excludes inactive activities by default", () => {
    const activities = [
      activity(endDate, true),
      activity(endDate, false),
      activity(endDate, false),
    ];
    const buckets = buildWeeklyHeatmap(activities, { endDate, weeks: 52 });
    expect(buckets[51].count).toBe(1);
  });

  it("includes inactive activities when includeInactive is true", () => {
    const activities = [
      activity(endDate, true),
      activity(endDate, false),
      activity(endDate, false),
    ];
    const buckets = buildWeeklyHeatmap(activities, {
      endDate,
      weeks: 52,
      includeInactive: true,
    });
    expect(buckets[51].count).toBe(3);
  });

  it("drops activities outside the window", () => {
    const old = activity(subWeeks(endDate, 60)); // older than 52 weeks
    const future = activity(addWeeks(endDate, 3)); // after endDate's week
    const buckets = buildWeeklyHeatmap([old, future], { endDate, weeks: 52 });
    expect(buckets.every((b) => b.count === 0)).toBe(true);
  });

  it("derives ISO week 53 and previous ISO year at the Jan-1 boundary", () => {
    // Fri Jan 1 2021 belongs to ISO week 53 of ISO year 2020.
    const endOf2020Boundary = localDay(2021, 0, 1);
    const buckets = buildWeeklyHeatmap([activity(endOf2020Boundary)], {
      endDate: endOf2020Boundary,
      weeks: 52,
    });
    const latest = buckets[51];

    const expectedWeekStart = startOfWeek(endOf2020Boundary, MONDAY); // Mon Dec 28 2020
    expect(latest.weekStart.getTime()).toBe(expectedWeekStart.getTime());
    expect(latest.isoWeek).toBe(getISOWeek(expectedWeekStart));
    expect(latest.isoWeek).toBe(53);
    expect(latest.isoYear).toBe(getISOWeekYear(expectedWeekStart));
    expect(latest.isoYear).toBe(2020);
    expect(latest.count).toBe(1);
  });
});

describe("getMonthLabels", () => {
  it("labels the first column and every column where the month changes", () => {
    const endDate = new Date(2024, 1, 5, 12); // Mon Feb 5 2024
    const buckets = buildWeeklyHeatmap([], { endDate, weeks: 8 });
    const labels = getMonthLabels(buckets);

    expect(labels).toHaveLength(buckets.length);
    expect(labels[0]).not.toBeNull(); // first column always labeled

    // A non-null label appears only when its month differs from the previous bucket.
    for (let i = 1; i < buckets.length; i++) {
      const changed =
        buckets[i].weekStart.getMonth() !== buckets[i - 1].weekStart.getMonth();
      if (changed) {
        expect(labels[i]).not.toBeNull();
      } else {
        expect(labels[i]).toBeNull();
      }
    }

    // At least one boundary exists across an 8-week window.
    expect(labels.filter((l) => l !== null).length).toBeGreaterThanOrEqual(2);
  });
});
