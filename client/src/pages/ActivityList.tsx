import * as React from "react";
import {
  DateFilterForm,
  ErrorView,
  Loading,
  SummaryTable,
} from "../components";
import {
  useActivities,
  useDateRangeState,
  filterByDateRange,
  sortDescendingByDate,
} from "../data";

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
