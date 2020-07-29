import React from "react";
import { SummaryTable } from "./components/Table/SummaryTable";
import { BarChart } from "./components/Visualization/Charts/BarChart";
import { SummaryPieChart } from "./components/Visualization/SummaryCharts/SummaryPieChart";
import { SummaryBarChart } from "./components/Visualization/SummaryCharts/SummaryBarChart";
import { transformDataToSummaryMap } from "./data/transform";
import { useQuery } from "react-query";
import axios from "axios";
import { ActivityRecord } from "./data/types";

function App() {
  const { isLoading, error, data } = useQuery<ActivityRecord[], "chartData">(
    "chartData",
    async () => {
      const getResult = await axios.get<ActivityRecord[]>("/api/getActivities");
      return getResult.data;
    }
  );

  if (isLoading) {
    return <>{"Loading..."}</>;
  }

  if (error) {
    return <>{"An error has occurred: " + error.message}</>;
  }
  const summaryMap = transformDataToSummaryMap(data || []);

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
        <SummaryTable records={data || []} />
      </div>
    </>
  );
}

export default App;
