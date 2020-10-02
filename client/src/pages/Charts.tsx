import * as React from "react";
import { ErrorView } from "../components/states/Error";
import { Loading } from "../components/states/Loading";
import { BarChart } from "../components/visualization/Charts/BarChart";
import { SummaryBarChart } from "../components/visualization/SummaryCharts/SummaryBarChart";
import { SummaryPieChart } from "../components/visualization/SummaryCharts/SummaryPieChart";
import { useActivities } from "../data/hooks/useActivities";
import { transformDataToSummaryMap } from "../data/utils/transforms";

export const Charts = () => {
  const { isLoading, error, data } = useActivities();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }
  const activitySummaries = transformDataToSummaryMap(data || []);
  return (
    <>
      <div style={{ width: 900, height: 500 }}>
        <BarChart activitySummaries={activitySummaries} />
      </div>
      <div style={{ width: 900, height: 500 }}>
        <SummaryPieChart activitySummaries={activitySummaries} />
      </div>
      <div style={{ width: 900, height: 500 }}>
        <SummaryBarChart activitySummaries={activitySummaries} />
      </div>
    </>
  );
};
