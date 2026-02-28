import type { ChartOptions, TooltipCallbacks, TooltipItem } from "chart.js";
import { Pie } from "react-chartjs-2";
import type { ActivitySummaries, CategoryOption } from "../../../data";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useChartColors } from "../../../utils/useChartColors";
import { getFlatPieChartData, getPieChartData } from "../pie-chart-data";

type Props = {
  activitySummaries: ActivitySummaries;
  allSummaries: ActivitySummaries;
  categoryOptions: CategoryOption[];
  groupByCategory?: boolean;
};

export function SummaryPieChart({
  activitySummaries,
  allSummaries,
  categoryOptions,
  groupByCategory = true,
}: Props) {
  const data = groupByCategory
    ? getPieChartData(activitySummaries, allSummaries, categoryOptions)
    : getFlatPieChartData(activitySummaries);
  const isMobile = useIsMobile();
  const chartColors = useChartColors();
  const tooltipCallback = groupByCategory
    ? groupedTooltipCallback
    : flatTooltipCallback;
  const options: ChartOptions<"pie"> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      tooltip: { callbacks: tooltipCallback },
      legend: {
        display: !isMobile,
        position: "right",
        labels: {
          color: chartColors.foreground,
        },
      },
    },
  };
  return (
    <Pie
      aria-label="Activities summary pie chart"
      data={data}
      options={options}
    />
  );
}

const groupedTooltipCallback: Partial<TooltipCallbacks<"pie">> = {
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
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

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

/** Tooltip callback for flat mode (2-dataset: outer=activities, inner=active/inactive) */
const flatTooltipCallback: Partial<TooltipCallbacks<"pie">> = {
  title: (items: TooltipItem<"pie">[]) => {
    if (!items.length) return "";
    const { datasetIndex, dataIndex, dataset } = items[0];
    if (datasetIndex === 1) {
      const labels = (dataset as unknown as Record<string, string[]>)
        .innerLabels;
      return labels?.[dataIndex] ?? "";
    }
    return items[0].label ?? "";
  },
  label: (context: TooltipItem<"pie">) => {
    const { datasetIndex, dataIndex, dataset } = context;
    const chartData = dataset.data as number[];
    const totalCount = chartData.reduce((sum, n) => sum + n, 0);
    const count = chartData[dataIndex];
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

    if (datasetIndex === 1) {
      const labels = (dataset as unknown as Record<string, string[]>)
        .innerLabels;
      return ` ${labels?.[dataIndex] ?? ""}: ${count} (${percentage.toFixed(1)}%)`;
    }
    return ` ${context.label ?? ""}: ${count} (${percentage.toFixed(1)}%)`;
  },
};
