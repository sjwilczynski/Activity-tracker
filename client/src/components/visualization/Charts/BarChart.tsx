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
  return (
    <Bar
      data={data}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        legend: {
          display: false,
        },
      }}
    />
  );
}
