import { ChartJsData } from "./types";
import { ActivitySummaryMap } from "../../data/types";

export function getDataForChartJs(data: ActivitySummaryMap): ChartJsData {
  const sortedKeys = Object.keys(data).sort((key1, key2) => {
    return +data[key1].active - +data[key2].active;
  });
  const activityCounts = getActivityCounts(data, sortedKeys);
  const colors = getBackgroundColors(data, sortedKeys);
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

export const getActiveAndInactiveCount = (
  data: ActivitySummaryMap,
  keys: string[]
) => {
  const activeCount = getActivityCounts(
    data,
    keys.filter((key) => data[key].active)
  ).reduce((counts, count) => counts + count, 0);
  const inactiveCount = getActivityCounts(
    data,
    keys.filter((key) => !data[key].active)
  ).reduce((counts, count) => counts + count, 0);
  return { activeCount, inactiveCount };
};

const getActivityCounts = (data: ActivitySummaryMap, keys: string[]) => {
  return keys.map((key) => data[key].count);
};

const getBackgroundColors = (data: ActivitySummaryMap, keys: string[]) => {
  return keys.map((key) => (data[key].active ? "#2ecc40" : "#ff4136"));
};
