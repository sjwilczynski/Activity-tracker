import type { ChartData } from "chart.js";
import type { ActivitySummaries, CategoryOption } from "../../data";
import {
  buildCategoryColorInfo,
  getActivityColor,
  hashActivityColor,
} from "./utils";

/** Build stacked bar chart data: one bar per category, stacked by activity.
 *  Uses allSummaries for stable structure/colors, filteredSummaries for counts. */
export function getStackedBarChartData(
  filteredSummaries: ActivitySummaries,
  allSummaries: ActivitySummaries,
  categoryOptions: CategoryOption[]
): ChartData<"bar", number[], string> {
  const info = buildCategoryColorInfo(allSummaries, categoryOptions);

  // Filter out categories with no data in the current filter
  const visibleCategoryNames = info.categoryNames.filter((cat) => {
    const activities = info.categoryActivities.get(cat) ?? [];
    return activities.some((name) => (filteredSummaries[name]?.count ?? 0) > 0);
  });

  const datasets = Object.keys(allSummaries).map((activityName) => ({
    label: activityName,
    data: visibleCategoryNames.map((cat) => {
      const activities = info.categoryActivities.get(cat) ?? [];
      if (!activities.includes(activityName)) return 0;
      return filteredSummaries[activityName]?.count ?? 0;
    }),
    backgroundColor: getActivityColor(activityName, info),
    stack: "stack",
  }));

  return { labels: visibleCategoryNames, datasets };
}

/** Build flat bar chart data: one bar per activity, no category grouping.
 *  Uses allSummaries for stable colors, filteredSummaries for counts. */
export function getFlatBarChartData(
  filteredSummaries: ActivitySummaries,
  allSummaries: ActivitySummaries
): ChartData<"bar", number[], string> {
  const sortedNames = Object.keys(allSummaries)
    .filter((name) => (filteredSummaries[name]?.count ?? 0) > 0)
    .sort((a, b) => {
      const countDiff =
        (filteredSummaries[b]?.count ?? 0) - (filteredSummaries[a]?.count ?? 0);
      return countDiff || a.localeCompare(b);
    });

  return {
    labels: sortedNames,
    datasets: [
      {
        label: "Count",
        data: sortedNames.map((name) => filteredSummaries[name]?.count ?? 0),
        backgroundColor: sortedNames.map((name) => hashActivityColor(name)),
      },
    ],
  };
}
