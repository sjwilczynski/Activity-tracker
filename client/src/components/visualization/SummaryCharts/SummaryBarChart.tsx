import { ActivitySummaries } from "../../../data";
import { Bar } from "react-chartjs-2";
import { sortKeys, getTotalCount } from "../utils";
import { ChartJsData } from "../types";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function SummaryBarChart(props: Props) {
  const data = getDataForSummaryBarChart(props.activitySummaries);
  return (
    <Bar
      data={data}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          labels: {
            filter: (item) => !item.text?.includes("threshold"),
          },
        },
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              stacked: true,
              gridLines: {
                display: false,
              },
              id: "y-axis-1",
            },
            {
              stacked: false,
              display: false,
              id: "y-axis-2",
            },
          ],
        },
      }}
    />
  );
}

const getDataForSummaryBarChart = (
  activitySummaries: ActivitySummaries
): ChartJsData => {
  const sortedKeys = sortKeys(activitySummaries);
  return {
    labels: ["Summary"],
    datasets: [
      ...getThresholdLines(activitySummaries),
      ...getStackedBars(activitySummaries, sortedKeys),
    ],
  };
};

const getStackedBars = (
  activitySummaries: ActivitySummaries,
  keys: string[]
) => {
  return keys.map((key) => {
    return {
      data: [activitySummaries[key].count],
      label: key,
      backgroundColor: [activitySummaries[key].active ? "#2ecc40" : "#ff4136"],
      borderWidth: 2,
      yAxisID: "y-axis-1",
    };
  });
};

const getThresholdLines = (activitySummaries: ActivitySummaries) => {
  const total = getTotalCount(Object.values(activitySummaries));
  return [1, 2, 3, 4, 5, 6, 7].map((fraction) => {
    return {
      data: [parseFloat(((fraction * total) / 7).toFixed(2))],
      type: "line",
      label: `${fraction} days per week threshold`,
      fill: false,
      borderColor: "#000000",
      yAxisID: "y-axis-2",
    };
  });
};
