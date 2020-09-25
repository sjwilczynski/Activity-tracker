import { ChartJsData } from "./types";
import { ActivitySummaries, ActivitySummary } from "../../data/types";

export function getDataInChartJsFormat(
  activitySummaries: ActivitySummaries
): ChartJsData {
  const sortedKeys = sortKeysByActive(activitySummaries);
  const activityCounts = getActivityCounts(activitySummaries, sortedKeys);
  const colors = getBackgroundColors(activitySummaries, sortedKeys);
  return {
    labels: sortedKeys,
    datasets: [
      {
        backgroundColor: colors,
        data: activityCounts,
        label: "activities",
      },
    ],
  };
}

export const sortKeysByActive = (activitySummaries: ActivitySummaries) =>
  Object.keys(activitySummaries).sort((key1, key2) => {
    return +activitySummaries[key2].active - +activitySummaries[key1].active;
  });

export const getTotalActiveAndInactiveCount = (
  activitySummaries: ActivitySummaries
) => {
  const activeCount = getTotalCount(
    Object.values(activitySummaries).filter(
      (activitySummary) => activitySummary.active
    )
  );
  const inactiveCount = getTotalCount(
    Object.values(activitySummaries).filter(
      (activitySummary) => !activitySummary.active
    )
  );
  return { activeCount, inactiveCount };
};

const getActivityCounts = (activitySummaries: ActivitySummaries, keys: string[]) => {
  return keys.map((key) => activitySummaries[key].count);
};

export const getTotalCount = (summaries: ActivitySummary[]) =>
  summaries.reduce(
    (counts, activitySummary) => counts + activitySummary.count,
    0
  );

const getBackgroundColors = (
  activitySummaries: ActivitySummaries,
  keys: string[]
) => {
  return keys.map((key) => (activitySummaries[key].active ? "#2ecc40" : "#ff4136"));
};
