import * as React from "react";
import { ActivitySummaryMap } from "../../../data/types";
import { Bar } from "react-chartjs-2";
import { getActiveAndInactiveCount } from "../utils";
import { ChartJsData } from "../types";

type Props = {
  data: ActivitySummaryMap;
};

export function SummaryBarChart(props: Props) {
  return (
    <Bar
      data={getDataForSummaryBarChart(props.data)}
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

const getDataForSummaryBarChart = (data: ActivitySummaryMap): ChartJsData => {
  const sortedKeys = Object.keys(data).sort((key1, key2) => {
    return +data[key2].active - +data[key1].active;
  });
  return {
    labels: ["Summary"],
    datasets: [
      ...getThresholdLines(data, sortedKeys),
      ...sortedKeys.map((key) => {
        return {
          data: [data[key].count],
          label: key,
          backgroundColor: [data[key].active ? "#2ecc40" : "#ff4136"],
          borderWidth: 2,
          yAxisID: "y-axis-1",
        };
      }),
    ],
  };
};

const getThresholdLines = (data: ActivitySummaryMap, keys: string[]) => {
  const { activeCount, inactiveCount } = getActiveAndInactiveCount(data, keys);
  const total = activeCount + inactiveCount;
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
