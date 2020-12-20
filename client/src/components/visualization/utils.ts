import { ChartJsData } from "./types";
import { ActivitySummaries, ActivitySummary } from "../../data";
import { TinyColor } from "@ctrl/tinycolor";

export function getDataInChartJsFormat(
  activitySummaries: ActivitySummaries
): ChartJsData {
  const sortedKeys = sortKeys(activitySummaries);
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

export const sortKeys = (activitySummaries: ActivitySummaries) =>
  Object.keys(activitySummaries).sort((key1, key2) => {
    const orderByActive =
      +activitySummaries[key2].active - +activitySummaries[key1].active;
    return orderByActive || key2.localeCompare(key1);
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

const getActivityCounts = (
  activitySummaries: ActivitySummaries,
  keys: string[]
) => {
  return keys.map((key) => activitySummaries[key].count);
};

export const getTotalCount = (summaries: ActivitySummary[]) =>
  summaries.reduce(
    (counts, activitySummary) => counts + activitySummary.count,
    0
  );

export const activeBaseColorHex = "#2ecc40";
export const inactiveBaseColorHex = "#ff4136";

export const getBackgroundColors = (
  activitySummaries: ActivitySummaries,
  keys: string[]
) => {
  const slices = 15;
  const activeBaseColor = new TinyColor(activeBaseColorHex);
  const inactiveBaseColor = new TinyColor(inactiveBaseColorHex);
  const activeCategoriesCount = keys.filter(
    (key) => activitySummaries[key].active
  ).length;
  const inactiveCategoriesCount = keys.filter(
    (key) => !activitySummaries[key].active
  ).length;
  return [
    ...activeBaseColor
      .analogous(
        activeCategoriesCount + 1,
        Math.max(slices, 2 * activeCategoriesCount)
      )
      .slice(1)
      .map((c) => c.toHexString()),
    ...inactiveBaseColor
      .analogous(
        inactiveCategoriesCount + 1,
        Math.max(slices, 2 * inactiveCategoriesCount)
      )
      .slice(1)
      .map((c) => c.toHexString()),
  ];
};
