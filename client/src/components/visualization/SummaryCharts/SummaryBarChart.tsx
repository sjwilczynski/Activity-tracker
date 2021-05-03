import { ActivitySummaries } from "../../../data";
import { Bar } from "react-chartjs-2";
import { sortKeys, getTotalCount, getBackgroundColors } from "../utils";
import { ChartJsData } from "../types";
import { useIsLightTheme } from "../../styles/StylesProvider";
import { ChartDataset } from "chart.js";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function SummaryBarChart(props: Props) {
  const isLightTheme = useIsLightTheme();
  const data = getDataForSummaryBarChart(props.activitySummaries, isLightTheme);
  return (
    <Bar
      data={data}
      type="bar"
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: "right",
            labels: {
              filter: (item: any) => !item.text?.includes("threshold"),
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false,
            },
          },
          y1: {
            stacked: true,
            grid: {
              display: false,
            },
          },
          y2: {
            stacked: false,
            display: false,
          },
        },
      }}
    />
  );
}

const getDataForSummaryBarChart = (
  activitySummaries: ActivitySummaries,
  isLightTheme: boolean
): ChartJsData => {
  const sortedKeys = sortKeys(activitySummaries);
  return {
    labels: ["Summary"],
    datasets: [
      ...getThresholdLines(activitySummaries),
      ...getStackedBars(activitySummaries, sortedKeys, isLightTheme),
    ],
  };
};

const getStackedBars = (
  activitySummaries: ActivitySummaries,
  keys: string[],
  isLightTheme: boolean
): ChartDataset[] => {
  const colors = getBackgroundColors(activitySummaries, keys, isLightTheme);
  return keys.map((key, index) => ({
    data: [activitySummaries[key].count],
    label: key,
    type: "bar",
    backgroundColor: [colors[index]],
    borderWidth: 2,
    yAxisID: "y1",
  }));
};

const getThresholdLines = (
  activitySummaries: ActivitySummaries
): ChartDataset[] => {
  const total = getTotalCount(Object.values(activitySummaries));
  return [1, 2, 3, 4, 5, 6, 7].map((fraction) => ({
    data: [parseFloat(((fraction * total) / 7).toFixed(2))],
    type: "line",
    label: `${fraction} days per week threshold`,
    fill: false,
    borderColor: "#000000",
    yAxisID: "y2",
  }));
};
