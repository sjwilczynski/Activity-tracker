import * as React from "react";
import { Pie } from "react-chartjs-2";
import { ChartJsData } from "../types";
import { ActivitySummaryMap } from "../../../data/types";
import {
  getTotalActiveAndInactiveCount,
  getDataInChartJsFormat,
} from "../utils";

type Props = {
  summaryMap: ActivitySummaryMap;
};

export function SummaryPieChart(props: Props) {
  const { summaryMap } = props;
  const chartJsData = getDataInChartJsFormat(summaryMap);
  return (
    <div style={{ width: 1000, height: 500 }}>
      <Pie
        data={{
          ...chartJsData,
          datasets: [
            ...chartJsData.datasets,
            getAdditionalSummaryDataset(summaryMap),
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

const getAdditionalSummaryDataset = (summaryMap: ActivitySummaryMap) => {
  const { activeCount, inactiveCount } = getTotalActiveAndInactiveCount(
    summaryMap
  );
  return {
    backgroundColor: ["#2ecc40", "#ff4136"],
    data: [activeCount, inactiveCount],
    weight: 0.35,
  };
};
