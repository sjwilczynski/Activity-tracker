import type { ChartOptions, TooltipCallbacks, TooltipItem } from "chart.js";
import { Pie } from "react-chartjs-2";
import type { ActivitySummaries, CategoryOption } from "../../../data";
import { getPieChartData } from "../utils";

type Props = {
  activitySummaries: ActivitySummaries;
  allSummaries: ActivitySummaries;
  categoryOptions: CategoryOption[];
};

export function SummaryPieChart({
  activitySummaries,
  allSummaries,
  categoryOptions,
}: Props) {
  const data = getPieChartData(
    activitySummaries,
    allSummaries,
    categoryOptions
  );
  return (
    <Pie
      aria-label="Activities summary pie chart"
      data={data}
      options={chartOptions}
    />
  );
}

const tooltipCallback: Partial<TooltipCallbacks<"pie">> = {
  title: (items: TooltipItem<"pie">[]) => {
    if (!items.length) return "";
    const { datasetIndex, dataIndex, dataset } = items[0];
    if (datasetIndex === 2) {
      const labels = (dataset as unknown as Record<string, string[]>)
        .innerLabels;
      return labels?.[dataIndex] ?? "";
    }
    if (datasetIndex === 1) {
      const labels = (dataset as unknown as Record<string, string[]>)
        .categoryLabels;
      return labels?.[dataIndex] ?? "";
    }
    return items[0].label ?? "";
  },
  label: (context: TooltipItem<"pie">) => {
    const { datasetIndex, dataIndex, dataset } = context;
    const chartData = dataset.data as number[];
    const totalCount = chartData.reduce((sum, n) => sum + n, 0);
    const count = chartData[dataIndex];
    const percentage = (count / totalCount) * 100;

    if (datasetIndex === 2) {
      const labels = (dataset as unknown as Record<string, string[]>)
        .innerLabels;
      return ` ${labels?.[dataIndex] ?? ""}: ${count} (${percentage.toFixed(1)}%)`;
    }
    if (datasetIndex === 1) {
      const labels = (dataset as unknown as Record<string, string[]>)
        .categoryLabels;
      return ` ${labels?.[dataIndex] ?? ""}: ${count} (${percentage.toFixed(1)}%)`;
    }
    return ` ${context.label ?? ""}: ${count} (${percentage.toFixed(1)}%)`;
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
