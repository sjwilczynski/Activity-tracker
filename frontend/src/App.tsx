import React from "react";
import mockData from "./data/mock-data.json";
import { SummaryTable } from "./components/Table/SummaryTable";
import { BarChart } from "./components/Visualization/Charts/BarChart";
import { SummaryPieChart } from "./components/Visualization/SummaryCharts/SummaryPieChart";
import { SummaryBarChart } from "./components/Visualization/SummaryCharts/SummaryBarChart";
import { transformData } from "./data/transform";

function App() {
  const data = transformData(mockData);

  return (
    <>
      <div style={{ width: 1000, height: 500 }}>
        <BarChart data={data} />
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <SummaryPieChart data={data} />
      </div>
      <div style={{ width: 1000, height: 500 }}>
        <SummaryBarChart data={data} />
      </div>
      <div style={{ width: 1000 }}>
        <SummaryTable data={mockData} />
      </div>
    </>
  );
}

export default App;
