import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  BarChart,
  ChartWrapper,
  DateFilterForm,
  ErrorView,
  Loading,
  NoActivitiesPage,
  SummaryBarChart,
  SummaryPieChart,
  useDateRange,
} from "../components";
import {
  filterByDateRange,
  transformDataToSummaryMap,
  useActivities,
} from "../data";

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
