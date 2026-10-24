import { darken } from "@/components/visualization/color";
import {
  activeBaseColor,
  buildCategoryColorInfo,
  getActivityColor,
  hashActivityColor,
  inactiveBaseColor,
} from "@/components/visualization/utils";
import type {
  ActivityRecordWithId,
  ActivitySummaries,
  CategoryOption,
} from "@/data";
import {
  getMonthCounts,
  getAvailableYears,
  getPeriodLabel,
  getYearCounts,
  periodsFromParams,
  MONTH_LABELS_SHORT,
  type ComparisonPeriod,
} from "../compare-utils";

export type ActivityPoint = {
  name: string;
  category: string;
  active: boolean;
  count: number;
  color: string;
};
export type DistributionSlice = { name: string; count: number; color: string };
export type DistributionRing = {
  id: string;
  label: string;
  inner: number;
  outer: number;
  slices: DistributionSlice[];
};
export type ComparisonSeries = {
  id: string;
  name: string;
  color: string;
  partial: boolean;
  points: { bucket: string; count: number }[];
};

export type ComparisonMode = "years" | "months" | "crowded";

export function getComparisonOptions(
  records: ActivityRecordWithId[],
  referenceDate: Date
): {
  id: ComparisonMode;
  label: string;
  periods: ComparisonPeriod[];
}[] {
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
  const monthPeriods = periodsFromParams(monthIds.slice(-2).join(","));
  return [
    {
      id: "years",
      label: yearPeriods.map(getPeriodLabel).join(" vs "),
      periods: yearPeriods,
    },
    {
      id: "months",
      label: monthPeriods.map(getPeriodLabel).join(" vs "),
      periods: monthPeriods,
    },
    {
      id: "crowded",
      label: "Seven months (crowded)",
      periods: periodsFromParams(monthIds.join(",")),
    },
  ];
}

export function getActivityPoints(
  summaries: ActivitySummaries,
  allSummaries: ActivitySummaries,
  categories: CategoryOption[],
  grouped: boolean
): ActivityPoint[] {
  const info = buildCategoryColorInfo(allSummaries, categories);
  const names = grouped
    ? info.categoryNames.flatMap(
        (category) => info.categoryActivities.get(category) ?? []
      )
    : Object.keys(summaries).sort(
        (a, b) => summaries[b].count - summaries[a].count
      );
  return names
    .filter((name) => (summaries[name]?.count ?? 0) > 0)
    .map((name) => ({
      name,
      category: info.activityToCategory.get(name.toLowerCase()) ?? "other",
      active: summaries[name].active,
      count: summaries[name].count,
      color: grouped ? getActivityColor(name, info) : hashActivityColor(name),
    }));
}

export function getCategorySlices(
  points: ActivityPoint[],
  all: ActivitySummaries,
  categories: CategoryOption[]
): DistributionSlice[] {
  const info = buildCategoryColorInfo(all, categories);
  return info.categoryNames
    .map((name) => ({
      name,
      count: points
        .filter((point) => point.category === name)
        .reduce((sum, point) => sum + point.count, 0),
      color: darken(info.categoryBaseColor.get(name)!, 5),
    }))
    .filter((slice) => slice.count > 0);
}

export function getDistributionRings(
  points: ActivityPoint[],
  all: ActivitySummaries,
  categories: CategoryOption[],
  grouped: boolean
): DistributionRing[] {
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const active = points
    .filter((point) => point.active)
    .reduce((sum, point) => sum + point.count, 0);
  const status = [
    { name: "Active", count: active, color: darken(activeBaseColor, 10) },
    {
      name: "Inactive",
      count: total - active,
      color: darken(inactiveBaseColor, 10),
    },
  ].filter((slice) => slice.name === "Active" || slice.count > 0);
  const inner = grouped ? 0.15 : 0.3 / 1.3;
  return [
    {
      id: "activities",
      label: "Activities",
      inner: grouped ? 0.5 : inner,
      outer: 1,
      slices: points,
    },
    ...(grouped
      ? [
          {
            id: "categories",
            label: "Categories",
            inner,
            outer: 0.5,
            slices: getCategorySlices(points, all, categories),
          },
        ]
      : []),
    {
      id: "status",
      label: "Category status",
      inner: 0,
      outer: inner,
      slices: status,
    },
  ];
}

export function getComparisonSeries(
  records: ActivityRecordWithId[],
  periods: ComparisonPeriod[],
  asOf?: Date
): ComparisonSeries[] {
  const active = records.filter((record) => record.active);
  return periods.map((period) => {
    const monthly = period.type === "month" && period.month !== undefined;
    const counts = monthly
      ? getMonthCounts(active, period.year, period.month!)
      : getYearCounts(active, period.year);
    const labels = monthly
      ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
      : MONTH_LABELS_SHORT;
    const currentYear = asOf?.getFullYear() === period.year;
    const currentMonth =
      currentYear && monthly && asOf?.getMonth() === period.month;
    const limit =
      !asOf || !currentYear
        ? counts.length
        : currentMonth
          ? Math.min(
              5,
              Math.ceil(
                (asOf.getDate() +
                  new Date(period.year, period.month!, 1).getDay()) /
                  7
              )
            )
          : monthly
            ? counts.length
            : asOf.getMonth() + 1;
    const partial = Boolean(asOf && currentYear && (!monthly || currentMonth));
    return {
      id: period.id,
      name: `${getPeriodLabel(period)}${partial ? " (partial)" : ""}`,
      color: period.color,
      partial,
      points: counts
        .slice(0, limit)
        .map((count, index) => ({ bucket: labels[index], count })),
    };
  });
}
