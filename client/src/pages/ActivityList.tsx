import { DateFilterForm } from "../components/forms/DateFilterForm/DateFilterForm";
import { useDateRange } from "../components/forms/DateFilterForm/shared";
import { ErrorView } from "../components/states/ErrorView";
import { Loading } from "../components/states/Loading";
import { NoActivitiesPage } from "../components/states/NoActivitiesPage";
import { SummaryTable } from "../components/table/SummaryTable";
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
