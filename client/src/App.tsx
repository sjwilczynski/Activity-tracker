import React from "react";
import { SummaryTable } from "./components/Table/SummaryTable";
import { BarChart } from "./components/Visualization/Charts/BarChart";
import { SummaryPieChart } from "./components/Visualization/SummaryCharts/SummaryPieChart";
import { SummaryBarChart } from "./components/Visualization/SummaryCharts/SummaryBarChart";
import { transformDataToSummaryMap } from "./data/transform";
import { useQuery } from "react-query";
import axios from "axios";
import { ActivityRecord } from "./data/types";
import { AddActivityForm } from "./components/Forms/AddActivityForm";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { useAuthContext } from "./components/Auth/AuthContext";

function App() {
  const authContext = useAuthContext();
  const { getIdToken } = authContext;
  const { isLoading, error, data } = useQuery<ActivityRecord[], Error>(
    "chartData",
    async () => {
      if (!getIdToken) {
        throw new Error("No function to fetch the token");
      } else {
        const idToken = await getIdToken();
        const config = { headers: { Authorization: `Bearer ${idToken}` } };
        const getResult = await axios.get<ActivityRecord[]>(
          "/api/activities",
          config
        );
        return Object.values(getResult.data);
      }
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

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
