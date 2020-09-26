import * as React from "react";
import { Pie } from "react-chartjs-2";
import { ChartJsData } from "../types";
import { ActivitySummaries } from "../../../data/types";
import {
  getTotalActiveAndInactiveCount,
  getDataInChartJsFormat,
} from "../utils";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function SummaryPieChart(props: Props) {
  const { activitySummaries } = props;
  const chartJsData = getDataInChartJsFormat(activitySummaries);
  const summaryDataset = getAdditionalSummaryDataset(activitySummaries);
  const data = {
    labels: chartJsData.labels,
    datasets: [chartJsData.datasets[0], summaryDataset],
  };
  return (
    <div style={{ width: 1000, height: 500 }}>
      <Pie
        data={data}
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
      const chartData = (data.datasets[datasetIndex].data || []) as number[];
      const totalCount = chartData.reduce(
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

const getAdditionalSummaryDataset = (activitySummaries: ActivitySummaries) => {
  const { activeCount, inactiveCount } = getTotalActiveAndInactiveCount(
    activitySummaries
  );
  return {
    backgroundColor: ["#2ecc40", "#ff4136"],
    data: [activeCount, inactiveCount],
    weight: 0.35,
    label: "activeVsInactive",
  };
};
