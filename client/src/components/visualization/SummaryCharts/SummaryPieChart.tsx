import { Pie } from "react-chartjs-2";
import { ChartJsData } from "../types";
import { ActivitySummaries } from "../../../data";
import {
  getTotalActiveAndInactiveCount,
  getDataInChartJsFormat,
  activeBaseColor,
  inactiveBaseColor,
} from "../utils";
import { useIsLightTheme } from "../../styles/StylesProvider";
import { TooltipItem } from "chart.js";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function SummaryPieChart({ activitySummaries }: Props) {
  const isLightTheme = useIsLightTheme();
  const chartJsData = getDataInChartJsFormat(activitySummaries, isLightTheme);
  const summaryDataset = getAdditionalSummaryDataset(
    activitySummaries,
    isLightTheme
  );
  const data = {
    labels: chartJsData.labels,
    datasets: [chartJsData.datasets[0], summaryDataset],
  };
  return (
    <Pie
      data={data}
      type="pie"
      options={{
        maintainAspectRatio: false,
        responsive: true,
        tooltips: tooltipCallback,
        plugins: {
          legend: {
            position: "right",
          },
        },
      }}
    />
  );
}

const tooltipCallback = {
  callbacks: {
    label: (tooltipItem: TooltipItem<"pie">, data: ChartJsData) => {
      const datasetIndex = tooltipItem?.datasetIndex || 0;
      const chartData = (data.datasets[datasetIndex].data || []) as number[];
      const totalCount = chartData.reduce(
        (counts, singleCount) => counts + singleCount,
        0
      );
      const count = chartData[tooltipItem?.dataIndex || 0];
      const percentage = (count / totalCount) * 100;
      // Hack alert: if it's additional summary dataset don't add a label
      const label =
        datasetIndex === 0
          ? data.labels[tooltipItem?.dataIndex || 0] + ":"
          : "";
      return ` ${label} Count: ${count}, percentage: ${percentage.toFixed(2)}%`;
    },
  },
};

const getAdditionalSummaryDataset = (
  activitySummaries: ActivitySummaries,
  isLightTheme: boolean
) => {
  const { activeCount, inactiveCount } = getTotalActiveAndInactiveCount(
    activitySummaries
  );
  const activeBaseColorThemed = isLightTheme
    ? activeBaseColor
    : activeBaseColor.darken(15);
  const inactiveBaseColorThemed = isLightTheme
    ? inactiveBaseColor
    : inactiveBaseColor.darken(15);
  return {
    backgroundColor: [
      activeBaseColorThemed.toHexString(),
      inactiveBaseColorThemed.toHexString(),
    ],
    data: [activeCount, inactiveCount],
    weight: 0.35,
    label: "activeVsInactive",
  };
};
