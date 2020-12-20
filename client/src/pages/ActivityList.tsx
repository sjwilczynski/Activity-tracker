import {
  DateFilterForm,
  useDateRange,
  ErrorView,
  Loading,
  SummaryTable,
} from "../components";
import {
  useActivities,
  filterByDateRange,
  sortDescendingByDate,
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

  return (
    <>
      <DateFilterForm />
      <div>
        <SummaryTable records={filteredData} />
      </div>
    </>
  );
};
