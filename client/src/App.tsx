import React from "react";
import { SummaryTable } from "./components/table/SummaryTable";
import { BarChart } from "./components/visualization/Charts/BarChart";
import { SummaryPieChart } from "./components/visualization/SummaryCharts/SummaryPieChart";
import { SummaryBarChart } from "./components/visualization/SummaryCharts/SummaryBarChart";
import { transformDataToSummaryMap } from "./data/utils/transform";
import { AddActivityForm } from "./components/forms/AddActivityForm";
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
  const activitySummaries = transformDataToSummaryMap(data || []);

  return (
    <>
      <AddActivityForm />
      <div style={{ width: 900, height: 500 }}>
        <BarChart activitySummaries={activitySummaries} />
      </div>
      <div style={{ width: 900, height: 500 }}>
        <SummaryPieChart activitySummaries={activitySummaries} />
      </div>
      <div style={{ width: 900, height: 500 }}>
        <SummaryBarChart activitySummaries={activitySummaries} />
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
