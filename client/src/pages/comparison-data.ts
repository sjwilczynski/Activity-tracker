import { endOfDay } from "date-fns";
import type { ActivityRecordWithId } from "@/data/types";
import {
  getAvailableYears,
  getMonthCounts,
  getPeriodLabel,
  getYearCounts,
  MONTH_LABELS_SHORT,
  periodsFromParams,
  type ComparisonPeriod,
} from "./compare-utils";

export type ComparisonSeries = {
  id: string;
  name: string;
  color: string;
  partial: boolean;
  upcoming: boolean;
  buckets: readonly string[];
  points: { bucket: string; count: number }[];
};
export type ComparisonMode = "years" | "months" | "crowded";

export function getComparisonOptions(
  records: ActivityRecordWithId[],
  referenceDate: Date
) {
  const years = getAvailableYears(records).slice(0, 2).reverse();
  const yearPeriods = periodsFromParams(
    (years.length ? years : [referenceDate.getFullYear()])
      .map((year) => `year-${year}`)
      .join(",")
  );
  const monthIds = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - 6 + index,
      1
    );
    return `month-${date.getFullYear()}-${date.getMonth()}`;
  });
  const months = periodsFromParams(monthIds.slice(-2).join(","));
  return [
    {
      id: "years",
      label: yearPeriods.map(getPeriodLabel).join(" vs "),
      periods: yearPeriods,
    },
    {
      id: "months",
      label: months.map(getPeriodLabel).join(" vs "),
      periods: months,
    },
    {
      id: "crowded",
      label: "Seven months",
      periods: periodsFromParams(monthIds.join(",")),
    },
  ] satisfies {
    id: ComparisonMode;
    label: string;
    periods: ComparisonPeriod[];
  }[];
}

export function getComparisonSeries(
  records: ActivityRecordWithId[],
  periods: ComparisonPeriod[],
  asOf: Date
): ComparisonSeries[] {
  const cutoff = endOfDay(asOf);
  const active = records.filter(
    (record) => record.active && record.date <= cutoff
  );
  return periods.map((period) => {
    const monthly = period.type === "month" && period.month !== undefined;
    const start = new Date(period.year, monthly ? period.month! : 0, 1);
    const end = new Date(period.year, monthly ? period.month! + 1 : 12, 1);
    const upcoming = start > cutoff;
    const partial = !upcoming && end > cutoff;
    const buckets = monthly
      ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
      : MONTH_LABELS_SHORT;
    const counts = monthly
      ? getMonthCounts(active, period.year, period.month!)
      : getYearCounts(active, period.year);
    const limit = upcoming
      ? 0
      : !partial
        ? counts.length
        : monthly
          ? Math.min(5, Math.ceil((asOf.getDate() + start.getDay()) / 7))
          : asOf.getMonth() + 1;
    return {
      id: period.id,
      name: `${getPeriodLabel(period)}${partial ? " (partial)" : upcoming ? " (not started)" : ""}`,
      color: period.color,
      partial,
      upcoming,
      buckets,
      points: counts
        .slice(0, limit)
        .map((count, index) => ({ bucket: buckets[index], count })),
    };
  });
}

export function getComparisonBuckets(series: ComparisonSeries[]): string[] {
  return [...new Set(series.flatMap((entry) => entry.buckets))];
}
