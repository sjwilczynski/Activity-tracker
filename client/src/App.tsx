import React from "react";
import mockData from "./data/mock-data.json";
import { SummaryTable } from "./components/Table/SummaryTable";
import { BarChart } from "./components/Visualization/Charts/BarChart";
import { SummaryPieChart } from "./components/Visualization/SummaryCharts/SummaryPieChart";
import { SummaryBarChart } from "./components/Visualization/SummaryCharts/SummaryBarChart";
import { transformDataToSummaryMap } from "./data/transform";

function App() {
  const summaryMap = transformDataToSummaryMap(mockData);

  return (
    <>
      <div style={{ width: 900, height: 500 }}>
        <BarChart summaryMap={summaryMap} />
      </div>
      <div style={{ width: 900, height: 500 }}>
        <SummaryPieChart summaryMap={summaryMap} />
      </div>
      <div style={{ width: 900, height: 500 }}>
        <SummaryBarChart summaryMap={summaryMap} />
      </div>
      <div style={{ width: 900 }}>
        <SummaryTable records={mockData} />
      </div>
    </>
  );
}

export default App;
