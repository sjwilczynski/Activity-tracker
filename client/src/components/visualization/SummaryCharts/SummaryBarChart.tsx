import type { ActivitySummaries } from "../../../data";
import { Bar } from "react-chartjs-2";
import { sortKeys, getTotalCount, getBackgroundColors } from "../utils";
import { useIsLightTheme } from "../../styles/StylesProvider";
import type {
  ChartData,
  ChartDataset,
  ChartOptions,
  LegendItem,
} from "chart.js";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function SummaryBarChart(props: Props) {
  const isLightTheme = useIsLightTheme();
  const data = getDataForSummaryBarChart(
    props.activitySummaries,
    isLightTheme
  ) as ChartData<"bar", number[], string>;
  return <Bar data={data} options={chartOptions} />;
}

const getDataForSummaryBarChart = (
  activitySummaries: ActivitySummaries,
  isLightTheme: boolean
): ChartData<"bar" | "line", number[], string> => {
  const sortedKeys = sortKeys(activitySummaries);
  return {
    labels: ["Summary"],
    datasets: [
      ...getThresholdLines(activitySummaries),
      ...getStackedBars(activitySummaries, sortedKeys, isLightTheme),
    ],
  };
};

const getStackedBars = (
  activitySummaries: ActivitySummaries,
  keys: string[],
  isLightTheme: boolean
): ChartDataset<"bar", number[]>[] => {
  const colors = getBackgroundColors(activitySummaries, keys, isLightTheme);
  return keys.map((key, index) => ({
    data: [activitySummaries[key].count],
    label: key,
    type: "bar",
    backgroundColor: [colors[index]],
    yAxisID: "y1",
  }));
};

const getThresholdLines = (
  activitySummaries: ActivitySummaries
): ChartDataset<"line", number[]>[] => {
  const total = getTotalCount(Object.values(activitySummaries));
  return [1, 2, 3, 4, 5, 6, 7].map((fraction) => ({
    data: [parseFloat(((fraction * total) / 7).toFixed(2))],
    type: "line",
    label: `${fraction} days per week threshold`,
    borderColor: "#000000",
    yAxisID: "y2",
  }));
};

const chartOptions: ChartOptions<"bar"> = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: "right",
      labels: {
        filter: (item: LegendItem) => !item.text.includes("threshold"),
      },
    },
  },
  interaction: {
    mode: "nearest",
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y1: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y2: {
      stacked: false,
      display: false,
    },
  },
};
