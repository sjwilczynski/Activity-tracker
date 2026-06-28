import {
  addWeeks,
  endOfWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfWeek,
} from "date-fns";

/** Minimal shape needed to aggregate activities into weekly buckets. */
export type HeatmapActivity = {
  date: Date;
  active: boolean;
};

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export type WeeklyBucket = {
  /** Local Monday that starts the week (primary identity). */
  weekStart: Date;
  /** Local Sunday that ends the week (display only). */
  weekEnd: Date;
  /** ISO week number, for display only. */
  isoWeek: number;
  /** ISO week-numbering year, for display only. */
  isoYear: number;
  count: number;
  level: HeatmapLevel;
};

export type BuildWeeklyHeatmapOptions = {
  endDate?: Date;
  weeks?: number;
  includeInactive?: boolean;
};

/** ISO 8601 weeks start on Monday. */
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

/** Bucket an activity count into one of five shade levels. */
export function getLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/** Stable per-week key derived from the local Monday week-start. */
function weekKey(date: Date): string {
  return format(startOfWeek(date, WEEK_OPTIONS), "yyyy-MM-dd");
}

/**
 * Aggregate activities into exactly `weeks` contiguous weekly buckets ending at
 * the week containing `endDate`. Empty weeks are present with count 0 / level 0.
 *
 * Weeks are keyed by their LOCAL Monday week-start; ISO week/year and week-end
 * are derived for DISPLAY only.
 */
export function buildWeeklyHeatmap(
  activities: ReadonlyArray<HeatmapActivity>,
  options: BuildWeeklyHeatmapOptions = {}
): WeeklyBucket[] {
  const { endDate = new Date(), weeks = 52, includeInactive = false } = options;

  const lastWeekStart = startOfWeek(endDate, WEEK_OPTIONS);

  const counts = new Map<string, number>();
  for (const activity of activities) {
    if (!includeInactive && !activity.active) continue;
    const key = weekKey(activity.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const buckets: WeeklyBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addWeeks(lastWeekStart, -i);
    const key = format(weekStart, "yyyy-MM-dd");
    const count = counts.get(key) ?? 0;
    buckets.push({
      weekStart,
      weekEnd: endOfWeek(weekStart, WEEK_OPTIONS),
      isoWeek: getISOWeek(weekStart),
      isoYear: getISOWeekYear(weekStart),
      count,
      level: getLevel(count),
    });
  }

  return buckets;
}

/**
 * Returns a label array aligned to `buckets`: a month short-name at the first
 * column and at every column whose month differs from the previous week,
 * `null` otherwise.
 */
export function getMonthLabels(
  buckets: ReadonlyArray<WeeklyBucket>
): (string | null)[] {
  return buckets.map((bucket, index) => {
    if (index === 0) return format(bucket.weekStart, "MMM");
    const prevMonth = buckets[index - 1].weekStart.getMonth();
    if (bucket.weekStart.getMonth() !== prevMonth) {
      return format(bucket.weekStart, "MMM");
    }
    return null;
  });
}
