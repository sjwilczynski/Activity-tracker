import { ChartJsData } from "./types";
import { ActivitySummaryMap, ActivitySummary } from "../../data/types";

export function getDataInChartJsFormat(
  summaryMap: ActivitySummaryMap
): ChartJsData {
  const sortedKeys = sortKeysByActive(summaryMap);
  const activityCounts = getActivityCounts(summaryMap, sortedKeys);
  const colors = getBackgroundColors(summaryMap, sortedKeys);
  return {
    labels: sortedKeys,
    datasets: [
      {
        backgroundColor: colors,
        data: activityCounts,
      },
    ],
  };
}

export const sortKeysByActive = (summaryMap: ActivitySummaryMap) =>
  Object.keys(summaryMap).sort((key1, key2) => {
    return +summaryMap[key2].active - +summaryMap[key1].active;
  });

export const getTotalActiveAndInactiveCount = (
  summaryMap: ActivitySummaryMap
) => {
  const activeCount = getTotalCount(
    Object.values(summaryMap).filter(
      (activitySummary) => activitySummary.active
    )
  );
  const inactiveCount = getTotalCount(
    Object.values(summaryMap).filter(
      (activitySummary) => !activitySummary.active
    )
  );
  return { activeCount, inactiveCount };
};

const getActivityCounts = (summaryMap: ActivitySummaryMap, keys: string[]) => {
  return keys.map((key) => summaryMap[key].count);
};

export const getTotalCount = (summaries: ActivitySummary[]) =>
  summaries.reduce(
    (counts, activitySummary) => counts + activitySummary.count,
    0
  );

const getBackgroundColors = (
  summaryMap: ActivitySummaryMap,
  keys: string[]
) => {
  return keys.map((key) => (summaryMap[key].active ? "#2ecc40" : "#ff4136"));
};
