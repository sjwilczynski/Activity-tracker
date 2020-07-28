import React from "react";
import mockData from "./mock-data.json";
import { Bar, Pie } from "react-chartjs-2";

type Activity = {
  name: string;
  active: boolean;
};

type ActivityRecord = {
  date: string;
  activity: Activity;
};

type ActivitySummary = {
  count: number;
  active: boolean;
};

type ActivitySummaryMap = {
  [key: string]: ActivitySummary;
};

type ChartJsData = {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string[];
    data: number[];
  }[];
};

function App() {
  const barChartData = getDataForBarChart(mockData);
  const dataForChartJs = getDataForChartJs(barChartData);

  return (
    <>
      <div>
        <ul>
          {Object.entries(barChartData).map(
            ([activityName, activitySummary]) => {
              return (
                <li key={activityName}>
                  {activityName}: {activitySummary.count}
                </li>
              );
            }
          )}
        </ul>
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <Bar
          data={dataForChartJs}
          options={{
            ...getChartOptions(dataForChartJs),
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
      <div style={{ width: 1000, height: 500 }}>
        <Pie data={dataForChartJs} options={getChartOptions(dataForChartJs)} />
      </div>
    </>
  );
}

const getChartOptions = (data: ChartJsData) => {
  const totalCount = Object.values(data.datasets[0].data).reduce(
    (counts, count) => counts + count,
    0
  );
  return {
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      callbacks: {
        label: (tooltipItem: Chart.ChartTooltipItem) => {
          const chartData = data.datasets[0].data;
          const count = chartData[tooltipItem?.index || 0];
          const percentage = (count / totalCount) * 100;
          return `Count: ${count}, percentage: ${percentage.toFixed(2)}%`;
        },
      },
    },
  };
};

const getDataForChartJs = (data: ActivitySummaryMap): ChartJsData => {
  return {
    labels: Object.keys(data),
    datasets: [
      {
        label: "",
        backgroundColor: getBackgroundColors(data),
        data: getActivityCounts(data),
      },
    ],
  };
};

const getActivityCounts = (data: ActivitySummaryMap) => {
  return Object.values(data).map((activitySummary) => activitySummary.count);
};

const getBackgroundColors = (data: ActivitySummaryMap) => {
  return Object.values(data).map((activitySummary) =>
    activitySummary.active ? "#2ecc40" : "#ff4136"
  );
};

const getDataForBarChart = (data: ActivityRecord[]) => {
  const activitySummary = data.reduce(
    (summary: ActivitySummaryMap, activityRecord: ActivityRecord) => {
      const { activity } = activityRecord;
      const { name, active } = activity;
      if (summary[name]) {
        summary[name].count += 1;
      } else {
        summary[name] = {
          count: 1,
          active,
        };
      }
      return summary;
    },
    {}
  );

  return activitySummary;
};

export default App;
