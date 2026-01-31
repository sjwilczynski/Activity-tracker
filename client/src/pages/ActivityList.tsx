import {
  DateFilterForm,
  ErrorView,
  Loading,
  NoActivitiesPage,
  SummaryTable,
  useDateRange,
} from "../components";
import {
  filterByDateRange,
  sortDescendingByDate,
  useActivities,
} from "../data";

export const ActivityList = () => {
  const { isLoading, error, data } = useActivities();
  const { startDate, endDate } = useDateRange();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  const filteredData = sortDescendingByDate(
    filterByDateRange(data || [], startDate, endDate)
  );

  return data?.length ? (
    <>
      <DateFilterForm />
      <SummaryTable records={filteredData} />
    </>
  ) : (
    <NoActivitiesPage />
  );
};
