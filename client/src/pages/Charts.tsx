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
import { DateRangePicker } from "../components/DateRangePicker";
import {
  useDateRange,
  useDateRangeState,
} from "../components/forms/DateFilterForm/shared";
import { ErrorView } from "../components/states/ErrorView";
import { Loading } from "../components/states/Loading";
import { NoActivitiesPage } from "../components/states/NoActivitiesPage";
import { BarChart } from "../components/visualization/Charts/BarChart";
import { ChartWrapper } from "../components/visualization/ChartWrapper";
import { SummaryBarChart } from "../components/visualization/SummaryCharts/SummaryBarChart";
import { SummaryPieChart } from "../components/visualization/SummaryCharts/SummaryPieChart";
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
  const [dateRange, setDateRange] = useDateRangeState();

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
      <div className="flex justify-end mb-4">
        <DateRangePicker
          value={{ from: dateRange.startDate, to: dateRange.endDate }}
          onChange={(range) =>
            setDateRange({ startDate: range.from, endDate: range.to })
          }
        />
      </div>
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
