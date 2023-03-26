import { Pie } from "react-chartjs-2";
import type { ActivitySummaries } from "../../../data";
import {
  getTotalActiveAndInactiveCount,
  getDataInChartJsFormat,
  activeBaseColor,
  inactiveBaseColor,
} from "../utils";
import { useIsLightTheme } from "../../styles/StylesProvider";
import type {
  ChartData,
  ChartOptions,
  TooltipCallbacks,
  TooltipItem,
} from "chart.js";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function SummaryPieChart({ activitySummaries }: Props) {
  const isLightTheme = useIsLightTheme();
  const chartJsData = getDataInChartJsFormat(
    activitySummaries,
    isLightTheme
  ) as ChartData<"pie", number[], string>;
  const summaryDataset = getAdditionalSummaryDataset(
    activitySummaries,
    isLightTheme
  );
  const data = {
    labels: chartJsData.labels,
    datasets: [chartJsData.datasets[0], summaryDataset],
  };
  return <Pie data={data} options={chartOptions} />;
}

const tooltipCallback: Partial<TooltipCallbacks<"pie">> = {
  label: (context: TooltipItem<"pie">) => {
    const { datasetIndex, dataIndex, label, dataset } = context;
    const chartData = dataset.data as number[];
    const totalCount = chartData.reduce(
      (counts, singleCount) => counts + singleCount,
      0
    );
    const count = chartData[dataIndex];
    const percentage = (count / totalCount) * 100;
    // Hack alert: if it's additional summary dataset don't add a label to prevent activity appearing for summary
    const newLabel = datasetIndex === 0 ? label + ":" : "";
    return ` ${newLabel} Count: ${count}, percentage: ${percentage.toFixed(
      2
    )}%`;
  },
};

const chartOptions: ChartOptions<"pie"> = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    tooltip: { callbacks: tooltipCallback },
    legend: {
      position: "right",
    },
  },
};

const getAdditionalSummaryDataset = (
  activitySummaries: ActivitySummaries,
  isLightTheme: boolean
) => {
  const { activeCount, inactiveCount } =
    getTotalActiveAndInactiveCount(activitySummaries);
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
