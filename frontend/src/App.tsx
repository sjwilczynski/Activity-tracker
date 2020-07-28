import React from "react";
import mockData from "./mock-data.json";
import { Bar, Pie } from "react-chartjs-2";

type ActivityRecord = {
  date: string;
  activity: string;
};

function App() {
  const barChartData = getDataForBarChart(mockData);
  const dataForChartJs = getDataForChartJs(barChartData);
  return (
    <>
      <div>
        <ul>
          {Object.entries(barChartData).map(([activity, count]) => {
            return (
              <li key={activity}>
                {activity}: {count}
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <Bar
          data={dataForChartJs}
          options={{
            maintainAspectRatio: true,
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
          }}
        />
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <Pie
          data={dataForChartJs}
          options={{
            maintainAspectRatio: true,
            responsive: true
          }}
        />
      </div>
    </>
  );
}

const getDataForChartJs = (data: { [key: string]: number }) => {
  return {
    labels: Object.keys(data),
    datasets: [
      {
        label: "Activities",
        backgroundColor: "#8884d8",
        data: Object.values(data),
      },
    ],
  };
};

const getDataForBarChart = (data: ActivityRecord[]) => {
  const activityCounts = data.reduce(
    (counts: { [key: string]: number }, activityRecord: ActivityRecord) => {
      const { activity } = activityRecord;
      if (counts[activity]) {
        counts[activity] += 1;
      } else {
        counts[activity] = 1;
      }
      return counts;
    },
    {}
  );

  return activityCounts;
};

export default App;
