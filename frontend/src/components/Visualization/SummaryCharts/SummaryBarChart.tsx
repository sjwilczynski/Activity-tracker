import * as React from "react";
import { ActivitySummaryMap } from "../../../data/types";
import { Bar } from "react-chartjs-2";
import { sortKeysByActive, getTotalCount } from "../utils";
import { ChartJsData } from "../types";

type Props = {
  summaryMap: ActivitySummaryMap;
};

export function SummaryBarChart(props: Props) {
  return (
    <Bar
      data={getDataForSummaryBarChart(props.summaryMap)}
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
  summaryMap: ActivitySummaryMap
): ChartJsData => {
  const sortedKeys = sortKeysByActive(summaryMap);
  return {
    labels: ["Summary"],
    datasets: [
      ...getThresholdLines(summaryMap),
      ...getStackedBars(summaryMap, sortedKeys),
    ],
  };
};

const getStackedBars = (summaryMap: ActivitySummaryMap, keys: string[]) => {
  return keys.map((key) => {
    return {
      data: [summaryMap[key].count],
      label: key,
      backgroundColor: [summaryMap[key].active ? "#2ecc40" : "#ff4136"],
      borderWidth: 2,
      yAxisID: "y-axis-1",
    };
  });
};

const getThresholdLines = (summaryMap: ActivitySummaryMap) => {
  const total = getTotalCount(Object.values(summaryMap));
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
