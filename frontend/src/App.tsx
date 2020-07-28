import React from "react";
import mockData from "./mock-data.json";
import { Bar, Pie } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { SummaryTable } from "./components/Table/SummaryTable";

export type Activity = {
  name: string;
  active: boolean;
};

export type ActivityRecord = {
  date: string;
  activity: Activity;
};

type ActivitySummary = {
  count: number;
  active: boolean;
};

type ActivitySummaryMap = {
  [key: string]: ActivitySummary;
};

type ChartJsData = {
  labels: string[];
  datasets: {
    label?: string;
    backgroundColor?: string[];
    data: number[];
    weight?: number;
    stack?: string;
    barPercentage?: number;
    type?: string;
    fill?: boolean;
    borderColor?: string;
    yAxisID?: string;
  }[];
};

function App() {
  const barChartData = getDataForBarChart(mockData);
  const dataForChartJs = getDataForChartJs(barChartData);

  return (
    <>
      <div style={{ width: 1000, height: 500 }}>
        <Bar
          data={dataForChartJs}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              xAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                },
              ],
              yAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                },
              ],
            },
            legend: {
              display: false,
            },
          }}
        />
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <Pie
          data={{
            ...dataForChartJs,
            datasets: [
              ...dataForChartJs.datasets,
              getAdditionalSummaryDataset(barChartData),
            ],
          }}
          options={{ ...getChartOptions(), tooltips: tooltipCallback }}
        />
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <Bar
          data={getDataForSummaryBarChart(barChartData)}
          options={{
            ...getChartOptions(),
            legend: {
              labels: {
                filter: (item, chart) => !item.text?.includes("threshold"),
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
      </div>
      <div style={{ width: 1000 }}>
        <SummaryTable data={mockData} />
      </div>
    </>
  );
}

const getChartOptions = (): ChartOptions => {
  return {
    maintainAspectRatio: false,
    responsive: true,
  };
};

const tooltipCallback = {
  callbacks: {
    label: (tooltipItem: Chart.ChartTooltipItem, data: ChartJsData) => {
      const datasetIndex = tooltipItem?.datasetIndex || 0;
      const chartData = data.datasets[datasetIndex].data;
      const totalCount = Object.values(data.datasets[datasetIndex].data).reduce(
        (counts, singleCount) => counts + singleCount,
        0
      );
      const count = chartData[tooltipItem?.index || 0];
      const percentage = (count / totalCount) * 100;
      // Hack alert: if it's additional summary dataset don't add a label
      const label =
        datasetIndex === 0 ? data.labels[tooltipItem?.index || 0] + ":" : "";
      return ` ${label} Count: ${count}, percentage: ${percentage.toFixed(2)}%`;
    },
  },
};

const getAdditionalSummaryDataset = (data: ActivitySummaryMap) => {
  const sortedKeys = Object.keys(data).sort((key1, key2) => {
    return +data[key1].active - +data[key2].active;
  });
  const { activeCount, inactiveCount } = getActiveAndInactiveCount(
    data,
    sortedKeys
  );
  return {
    backgroundColor: ["#ff4136", "#2ecc40"],
    data: [inactiveCount, activeCount],
    weight: 0.35,
  };
};

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

const getDataForChartJs = (data: ActivitySummaryMap): ChartJsData => {
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
};

const getActiveAndInactiveCount = (
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

const getDataForBarChart = (data: ActivityRecord[]) => {
  const activitySummary = data.reduce(
    (summary: ActivitySummaryMap, activityRecord: ActivityRecord) => {
      const { activity } = activityRecord;
      const { name, active } = activity;
      if (summary[name]) {
        summary[name].count += 1;
      } else {
        summary[name] = {
          count: 1,
          active,
        };
      }
      return summary;
    },
    {}
  );

  return activitySummary;
};

export default App;
