import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ActivitySummaries, CategoryOption } from "../../../data";
import { useChartColors } from "../../../utils/useChartColors";
import { getFlatBarChartData, getStackedBarChartData } from "../utils";

type Props = {
  activitySummaries: ActivitySummaries;
  allSummaries: ActivitySummaries;
  categoryOptions: CategoryOption[];
  groupByCategory?: boolean;
};

export function BarChart({
  activitySummaries,
  allSummaries,
  categoryOptions,
  groupByCategory = true,
}: Props) {
  const data = groupByCategory
    ? getStackedBarChartData(activitySummaries, allSummaries, categoryOptions)
    : getFlatBarChartData(activitySummaries, allSummaries);
  const chartColors = useChartColors();
  const options: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        ticks: { color: chartColors.mutedForeground },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: { color: chartColors.mutedForeground },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const item = items[0];
            return item?.dataset.label || item?.label || "";
          },
        },
      },
    },
    elements: {
      bar: { borderRadius: 6 },
    },
  };
  return (
    <Bar aria-label="Activities bar chart" data={data} options={options} />
  );
}
