import { Bar } from "react-chartjs-2";
import { ActivitySummaries } from "../../../data";
import { getDataInChartJsFormat } from "../utils";

type Props = {
  activitySummaries: ActivitySummaries;
};

export function BarChart(props: Props) {
  const data = getDataInChartJsFormat(props.activitySummaries);
  return (
    <div style={{ width: 1000, height: 500 }}>
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
    </div>
  );
}
