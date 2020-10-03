import * as React from "react";
import { DateFilterForm } from "../components/forms/DateFilterForm";
import { ErrorView } from "../components/states/Error";
import { Loading } from "../components/states/Loading";
import { SummaryTable } from "../components/table/SummaryTable";
import { useActivities } from "../data/hooks/useActivities";
import { useDateRangeState } from "../data/hooks/useDateRangeState";
import {
  filterByDateRange,
  sortDescendingByDate,
} from "../data/utils/transforms";

export const ActivityList = () => {
  const { isLoading, error, data } = useActivities();
  const { startDate, endDate, setDateRange } = useDateRangeState();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  const filteredData = sortDescendingByDate(
    filterByDateRange(data || [], startDate, endDate)
  );

  return (
    <>
      <DateFilterForm
        startDate={startDate}
        endDate={endDate}
        setDateRange={setDateRange}
      />
      <div style={{ width: 900 }}>
        <SummaryTable records={filteredData} />
      </div>
    </>
  );
};
