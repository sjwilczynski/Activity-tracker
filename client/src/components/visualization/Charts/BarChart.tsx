import { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ActivitySummaries } from "../../../data";
import { useIsLightTheme } from "../../styles/StylesProvider";
import { getDataInChartJsFormat } from "../utils";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function BarChart(props: Props) {
  const isLightTheme = useIsLightTheme();
  const data = getDataInChartJsFormat(props.activitySummaries, isLightTheme);
  return <Bar data={data} options={chartOptions} />;
}

const chartOptions: ChartOptions<"bar"> = {
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};
