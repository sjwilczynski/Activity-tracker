import {
  BarChart,
  DateFilterForm,
  ErrorView,
  Loading,
  SummaryPieChart,
  SummaryBarChart,
  ChartWrapper,
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
      <ChartWrapper>
        <BarChart activitySummaries={activitySummaries} />
      </ChartWrapper>
      <ChartWrapper>
        <SummaryPieChart activitySummaries={activitySummaries} />
      </ChartWrapper>
      <ChartWrapper>
        <SummaryBarChart activitySummaries={activitySummaries} />
      </ChartWrapper>
    </>
  );
};
