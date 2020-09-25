import React from "react";
import { SummaryTable } from "./components/Table/SummaryTable";
import { BarChart } from "./components/Visualization/Charts/BarChart";
import { SummaryPieChart } from "./components/Visualization/SummaryCharts/SummaryPieChart";
import { SummaryBarChart } from "./components/Visualization/SummaryCharts/SummaryBarChart";
import { transformDataToSummaryMap } from "./data/utils/transform";
import { AddActivityForm } from "./components/Forms/AddActivityForm";
import { AuthProvider } from "./auth/AuthProvider";
import { useActivities } from "./data/hooks/useActivities";
import { QueryConfigProvider } from "./data/react-query-config/QueryConfigProvider";

function App() {
  const { isLoading, error, data } = useActivities();

  if (isLoading) {
    return <>{"Loading..."}</>;
  }

  if (error) {
    return <>{"An error has occurred: " + error.message}</>;
  }
  const summaryMap = transformDataToSummaryMap(data || []);

  return (
    <>
      <AddActivityForm />
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

function AppWithProviders() {
  return (
    <AuthProvider>
      <QueryConfigProvider>
        <App />
      </QueryConfigProvider>
    </AuthProvider>
  );
}

export default AppWithProviders;
