import {
  BarChart,
  DateFilterForm,
  ErrorView,
  Loading,
  SummaryPieChart,
  SummaryBarChart,
  ChartWrapper,
  useDateRange,
  NoActivitiesPage,
} from "../components";
import {
  useActivities,
  filterByDateRange,
  transformDataToSummaryMap,
} from "../data";
import {
  Chart,
  BarController,
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  PieController,
} from "chart.js";

Chart.register(
  BarElement,
  BarController,
  CategoryScale,
  ArcElement,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineController,
  LineElement,
  PieController
);

export const Charts = () => {
  const { isLoading, error, data } = useActivities();
  const { startDate, endDate } = useDateRange();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }
  const activitySummaries = transformDataToSummaryMap(
    filterByDateRange(data || [], startDate, endDate)
  );
  return data?.length ? (
    <>
      <DateFilterForm />
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
  ) : (
    <NoActivitiesPage />
  );
};
