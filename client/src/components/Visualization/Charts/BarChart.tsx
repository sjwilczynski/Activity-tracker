import * as React from "react";
import { Bar } from "react-chartjs-2";
import { ActivitySummaryMap } from "../../../data/types";
import { getDataInChartJsFormat } from "../utils";

type Props = {
  summaryMap: ActivitySummaryMap;
};

export function BarChart(props: Props) {
  return (
    <div style={{ width: 1000, height: 500 }}>
      <Bar
        data={getDataInChartJsFormat(props.summaryMap)}
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
