import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  PieController,
  Tooltip,
} from "chart.js";
import { BarChart3 } from "lucide-react";
import { DateRangePicker } from "../components/DateRangePicker";
import {
  useDateRange,
  useDateRangeState,
} from "../components/forms/DateFilterForm/shared";
import { ErrorView } from "../components/states/ErrorView";
import { Loading } from "../components/states/Loading";
import { NoActivitiesPage } from "../components/states/NoActivitiesPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { BarChart } from "../components/visualization/Charts/BarChart";
import { SummaryPieChart } from "../components/visualization/SummaryCharts/SummaryPieChart";
import { sortKeys } from "../components/visualization/utils";
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

  if (!data?.length) {
    return <NoActivitiesPage />;
  }

  const filtered = filterByDateRange(data, startDate, endDate);
  const activitySummaries = transformDataToSummaryMap(filtered);
  const keys = sortKeys(activitySummaries);
  const uniqueCount = keys.length;
  const mostPopular = keys
    .filter((k) => activitySummaries[k].active)
    .sort((a, b) => activitySummaries[b].count - activitySummaries[a].count)[0];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold heading-gradient">
            Activity Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize your activity patterns
          </p>
        </div>
        <DateRangePicker
          value={{ from: dateRange.startDate, to: dateRange.endDate }}
          onChange={(range) =>
            setDateRange({ startDate: range.from, endDate: range.to })
          }
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4">
              <BarChart3 className="size-7 text-primary" />
            </div>
            <p className="text-lg font-medium">No activities found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try selecting a different date range or log some activities first
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className="border-l-[3px]"
              style={{ borderLeftColor: "var(--chart-2)" }}
            >
              <CardHeader>
                <CardTitle>Total Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: "var(--chart-2)" }}
                >
                  {filtered.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In selected date range
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-l-[3px]"
              style={{ borderLeftColor: "var(--chart-3)" }}
            >
              <CardHeader>
                <CardTitle>Unique Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: "var(--chart-3)" }}
                >
                  {uniqueCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Different activity types
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-l-[3px]"
              style={{ borderLeftColor: "var(--chart-1)" }}
            >
              <CardHeader>
                <CardTitle>Most Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold capitalize"
                  style={{ color: "var(--chart-1)" }}
                >
                  {mostPopular || "None"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mostPopular
                    ? `${activitySummaries[mostPopular].count} times`
                    : "No active activities"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Frequency Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Frequency</CardTitle>
              <CardDescription>
                Number of times each activity was logged
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative min-h-[50vh]">
                <BarChart activitySummaries={activitySummaries} />
              </div>
            </CardContent>
          </Card>

          {/* Activity Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>
                Breakdown by type and active vs inactive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative min-h-[50vh]">
                <SummaryPieChart activitySummaries={activitySummaries} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
