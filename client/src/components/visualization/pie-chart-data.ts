import type { ChartData } from "chart.js";
import type { ActivitySummaries, CategoryOption } from "../../data";
import { darken } from "./color";
import {
  activeBaseColor,
  buildCategoryColorInfo,
  getActivityColor,
  getTotalActiveAndInactiveCount,
  hashActivityColor,
  inactiveBaseColor,
} from "./utils";

/** Build 3-ring pie chart data: inner=active/inactive, middle=categories, outer=activities */
export function getPieChartData(
  activitySummaries: ActivitySummaries,
  allSummaries: ActivitySummaries,
  categoryOptions: CategoryOption[]
): ChartData<"pie", number[], string> {
  const info = buildCategoryColorInfo(allSummaries, categoryOptions);

  // --- Inner ring: Active vs Inactive (slightly darker to differentiate from other rings) ---
  const { activeCount, inactiveCount } =
    getTotalActiveAndInactiveCount(activitySummaries);
  const innerDataset = {
    data: [activeCount, ...(inactiveCount > 0 ? [inactiveCount] : [])],
    backgroundColor: [
      darken(activeBaseColor, 10),
      ...(inactiveCount > 0 ? [darken(inactiveBaseColor, 10)] : []),
    ],
    label: "Active vs Inactive",
    weight: 0.3,
  };

  // --- Middle ring: Per-category totals (slightly darker than outer ring) ---
  const visibleCategories = info.categoryNames.filter((cat) => {
    const activities = info.categoryActivities.get(cat) ?? [];
    return activities.some((name) => (activitySummaries[name]?.count ?? 0) > 0);
  });
  const categoryData = visibleCategories.map((cat) => {
    const activities = info.categoryActivities.get(cat) ?? [];
    return activities.reduce(
      (sum, name) => sum + (activitySummaries[name]?.count ?? 0),
      0
    );
  });
  const categoryColors = visibleCategories.map((cat) =>
    darken(info.categoryBaseColor.get(cat)!, 5)
  );
  const middleDataset = {
    data: categoryData,
    backgroundColor: categoryColors,
    label: "Categories",
    weight: 0.7,
    categoryLabels: visibleCategories,
  };

  // --- Outer ring: Per-activity ---
  // Activities ordered by category to align with the middle ring
  const orderedActivities: { name: string; count: number; color: string }[] =
    [];
  for (const cat of visibleCategories) {
    const activities = info.categoryActivities.get(cat) ?? [];
    for (const name of activities) {
      const count = activitySummaries[name]?.count ?? 0;
      if (count > 0) {
        orderedActivities.push({
          name,
          count,
          color: getActivityColor(name, info),
        });
      }
    }
  }
  const outerDataset = {
    data: orderedActivities.map((a) => a.count),
    backgroundColor: orderedActivities.map((a) => a.color),
    label: "Activities",
    weight: 1,
  };

  const innerLabels = ["Active", ...(inactiveCount > 0 ? ["Inactive"] : [])];
  (innerDataset as Record<string, unknown>).innerLabels = innerLabels;

  return {
    labels: orderedActivities.map((a) => a.name),
    datasets: [outerDataset, middleDataset, innerDataset],
  };
}

/** Build flat pie chart data: 2 rings — inner (active/inactive), outer (per-activity). */
export function getFlatPieChartData(
  activitySummaries: ActivitySummaries
): ChartData<"pie", number[], string> {
  // --- Inner ring: Active vs Inactive ---
  const { activeCount, inactiveCount } =
    getTotalActiveAndInactiveCount(activitySummaries);
  const innerLabels = ["Active", ...(inactiveCount > 0 ? ["Inactive"] : [])];
  const innerDataset = {
    data: [activeCount, ...(inactiveCount > 0 ? [inactiveCount] : [])],
    backgroundColor: [
      darken(activeBaseColor, 10),
      ...(inactiveCount > 0 ? [darken(inactiveBaseColor, 10)] : []),
    ],
    label: "Active vs Inactive",
    weight: 0.3,
    innerLabels,
  };

  // --- Outer ring: Per-activity ---
  const entries = Object.entries(activitySummaries)
    .filter(([, s]) => s.count > 0)
    .sort(([, a], [, b]) => b.count - a.count);

  const outerDataset = {
    data: entries.map(([, s]) => s.count),
    backgroundColor: entries.map(([name]) => hashActivityColor(name)),
    label: "Activities",
    weight: 1,
  };

  return {
    labels: entries.map(([name]) => name),
    datasets: [outerDataset, innerDataset],
  };
}
