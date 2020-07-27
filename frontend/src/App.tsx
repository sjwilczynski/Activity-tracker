import React from "react";
import mockData from "./mock-data.json";
import { FlexibleXYPlot, XAxis, YAxis, VerticalBarSeries } from "react-vis";
import {
  BarChart,
  Bar,
  XAxis as RCXAxis,
  YAxis as RCYAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Bar as Bar2 } from "react-chartjs-2";

type ActivityRecord = {
  date: string;
  activity: string;
};

function App() {
  const barChartData = getDataForBarChart(mockData);
  const dataForVis = getDataForVis(barChartData);
  const dataForRecharts = getDataForRecharts(barChartData);
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
        <FlexibleXYPlot xType="ordinal" xDistance={100}>
          <XAxis />
          <YAxis />
          <VerticalBarSeries data={dataForVis} barWidth={0.5} />
        </FlexibleXYPlot>
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <ResponsiveContainer width="100%">
          <BarChart data={dataForRecharts}>
            <RCXAxis dataKey="name" />
            <RCYAxis />
            <Tooltip isAnimationActive={false}/>
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <Bar2
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
    </>
  );
}

const getDataForChartJs = (data: { [key: string]: number }) => {
  return {
    labels: Object.keys(data),
    datasets: [
      {
        backgroundColor: "#8884d8",
        data: Object.values(data),
      },
    ],
  };
};

const getDataForRecharts = (data: { [key: string]: number }) => {
  return Object.entries(data).map(([activity, count]) => ({
    name: activity,
    count,
  }));
};

const getDataForVis = (data: { [key: string]: number }) => {
  return Object.entries(data).map(([activity, count]) => ({
    x: activity,
    y: count,
  }));
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
