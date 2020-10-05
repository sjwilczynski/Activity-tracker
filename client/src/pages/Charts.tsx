import * as React from "react";
import {
  BarChart,
  DateFilterForm,
  ErrorView,
  Loading,
  SummaryPieChart,
  SummaryBarChart,
} from "../components";
import {
  useActivities,
  useDateRangeState,
  filterByDateRange,
  transformDataToSummaryMap,
} from "../data";

export const Charts = () => {
  const { isLoading, error, data } = useActivities();
  const { startDate, endDate, setDateRange } = useDateRangeState();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }
  const activitySummaries = transformDataToSummaryMap(
    filterByDateRange(data || [], startDate, endDate)
  );
  return (
    <>
      <DateFilterForm
        startDate={startDate}
        endDate={endDate}
        setDateRange={setDateRange}
      />
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
