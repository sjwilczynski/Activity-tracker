import * as React from "react";
import { Pie } from "react-chartjs-2";
import { ChartJsData } from "../types";
import { ActivitySummaryMap } from "../../../data/types";
import { getActiveAndInactiveCount, getDataForChartJs } from "../utils";

type Props = {
  data: ActivitySummaryMap;
};

export function SummaryPieChart(props: Props) {
  const { data } = props;
  const chartJsData = getDataForChartJs(data);
  return (
    <div style={{ width: 1000, height: 500 }}>
      <Pie
        data={{
          ...chartJsData,
          datasets: [
            ...chartJsData.datasets,
            getAdditionalSummaryDataset(data),
          ],
        }}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          tooltips: tooltipCallback,
        }}
      />
    </div>
  );
}

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
