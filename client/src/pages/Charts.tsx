import { BarChart3, EyeOff } from "lucide-react";
import { useState } from "react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useDateRangeState } from "@/components/forms/DateFilterForm/shared";
import { ErrorView } from "@/components/states/ErrorView";
import { Loading } from "@/components/states/Loading";
import { NoActivitiesPage } from "@/components/states/NoActivitiesPage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getActivityPoints } from "@/components/visualization/Charts/activity-chart-data";
import { ActivityDataTable } from "@/components/visualization/Charts/ActivityDataTable";
import { BarChart } from "@/components/visualization/Charts/BarChart";
import { SummaryPieChart } from "@/components/visualization/SummaryCharts/SummaryPieChart";
import {
  filterByDateRange,
  transformDataToSummaryMap,
  useActivities,
  useAvailableCategories,
} from "@/data";
import {
  useUpdatePreferences,
  useUserPreferences,
} from "@/data/hooks/preferences/useUserPreferences";
import { cn } from "@/utils/cn";
import { AnalyticsComparison } from "./AnalyticsComparison";
import { ChartSummaryStats } from "./ChartSummaryStats";

export const Charts = () => {
  const { isLoading, error, data } = useActivities();
  const {
    availableCategories,
    isLoading: categoriesLoading,
    error: categoryError,
    refetch: refetchCategories,
  } = useAvailableCategories();
  const [dateRange, setDateRange] = useDateRangeState();
  const preferences = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const groupByCategory = preferences.data?.groupByCategory ?? true;
  const [showInactive, setShowInactive] = useState(true);

  if (isLoading || categoriesLoading) return <Loading />;
  if (error) return <ErrorView error={error} />;
  if (!data?.length) return <NoActivitiesPage />;

  const records = data.filter((record) => showInactive || record.active);
  const filtered = filterByDateRange(
    records,
    dateRange.startDate,
    dateRange.endDate
  );
  const allSummaries = transformDataToSummaryMap(data);
  const summaries = transformDataToSummaryMap(filtered);
  const points = getActivityPoints(
    summaries,
    allSummaries,
    availableCategories,
    groupByCategory
  );

  return (
    <div className="activity-charts space-y-4 sm:space-y-6">
      {categoryError && (
        <div role="alert" className="text-sm text-destructive">
          Categories could not be loaded.{" "}
          <button
            className="underline"
            onClick={() => void refetchCategories()}
          >
            Try again
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold heading-gradient">
            Activity Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize your activity patterns
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            aria-pressed={groupByCategory}
            disabled={!preferences.data || updatePreferences.isPending}
            onClick={() => {
              if (preferences.data)
                updatePreferences.mutate({
                  ...preferences.data,
                  groupByCategory: !groupByCategory,
                });
            }}
          >
            Group by category
          </Button>
          <button
            type="button"
            onClick={() => setShowInactive((value) => !value)}
            aria-pressed={!showInactive}
            aria-label="Hide inactive"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              !showInactive
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:bg-accent"
            )}
          >
            <EyeOff className="size-4" />
            <span className="hidden sm:inline">Hide inactive</span>
          </button>
          <DateRangePicker
            value={{ from: dateRange.startDate, to: dateRange.endDate }}
            onChange={(range) =>
              setDateRange({ startDate: range.from, endDate: range.to })
            }
          />
        </div>
        {updatePreferences.isError && (
          <p role="alert" className="text-sm text-destructive">
            Chart grouping could not be saved. Try again.
          </p>
        )}
      </div>
      <ChartSummaryStats summaries={summaries} />
      {points.length ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Activity Frequency</CardTitle>
              <CardDescription>
                Number of times each activity was logged
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart points={points} grouped={groupByCategory} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>
                Breakdown by type and current category status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SummaryPieChart
                points={points}
                allSummaries={allSummaries}
                categories={availableCategories}
                grouped={groupByCategory}
              />
            </CardContent>
          </Card>
          <ActivityDataTable points={points} />
        </>
      ) : (
        <Card>
          <CardContent
            role="status"
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4">
              <BarChart3 className="size-7 text-primary" />
            </div>
            <p className="text-lg font-medium">No activities found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try another date range or show inactive categories.
            </p>
          </CardContent>
        </Card>
      )}
      <AnalyticsComparison records={data} />
    </div>
  );
};
