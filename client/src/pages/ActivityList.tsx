import * as React from "react";
import { ErrorView } from "../components/states/Error";
import { Loading } from "../components/states/Loading";
import { SummaryTable } from "../components/table/SummaryTable";
import { useActivities } from "../data/hooks/useActivities";

export const ActivityList = () => {
  const { isLoading, error, data } = useActivities();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div style={{ width: 900 }}>
      <SummaryTable records={data || []} />
    </div>
  );
};
