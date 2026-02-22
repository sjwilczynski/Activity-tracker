import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { GitCompare } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useSearchParams } from "react-router";
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
import { useActivities } from "../data";
import type { ActivityRecordWithId } from "../data";
import { useChartColors } from "../utils/useChartColors";
import {
  type ComparisonPeriod,
  MONTH_LABELS_SHORT,
  MONTH_NAMES,
  getAvailableYears,
  getMonthCounts,
  getMostPopularActivity,
  getPeriodActivities,
  getPeriodLabel,
  getYearCounts,
  periodsFromParams,
  periodsToParam,
} from "./compare-utils";
import { PeriodSelector } from "./PeriodSelector";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function getMostActiveTimeUnit(
  activities: ActivityRecordWithId[],
  period: ComparisonPeriod,
): string {
  const periodActivities = getPeriodActivities(activities, period);
  if (periodActivities.length === 0) return "None";

  if (period.type === "month") {
    const dayCounts: Record<number, number> = {};
    for (const a of periodActivities) {
      const day = a.date.getDate();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    const entries = Object.entries(dayCounts);
    if (entries.length === 0) return "None";
    entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    const day = Number(entries[0][0]);
    const monthName = MONTH_NAMES[period.month ?? 0].slice(0, 3);
    return `${monthName} ${day}`;
  } else {
    const monthCounts: Record<number, number> = {};
    for (const a of periodActivities) {
      const month = a.date.getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
    const entries = Object.entries(monthCounts);
    if (entries.length === 0) return "None";
    entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    return MONTH_NAMES[Number(entries[0][0])];
  }
}

export const Compare = () => {
  const { isLoading, error, data } = useActivities();
  const [searchParams, setSearchParams] = useSearchParams();
  const chartColors = useChartColors();

  const periods = useMemo(
    () => periodsFromParams(searchParams.get("periods")),
    [searchParams]
  );

  const setPeriods = useCallback(
    (
      updater:
        | ComparisonPeriod[]
        | ((prev: ComparisonPeriod[]) => ComparisonPeriod[])
    ) => {
      setSearchParams(
        (prev) => {
          const currentPeriods = periodsFromParams(prev.get("periods"));
          const next =
            typeof updater === "function" ? updater(currentPeriods) : updater;
          const params = new URLSearchParams(prev);
          if (next.length === 0) {
            params.delete("periods");
          } else {
            params.set("periods", periodsToParam(next));
          }
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const availableYears = useMemo(
    () => (data ? getAvailableYears(data) : []),
    [data]
  );

  const activeData = useMemo(
    () => (data ? data.filter((a) => a.active) : []),
    [data]
  );

  if (isLoading) return <Loading />;
  if (error) return <ErrorView error={error} />;
  if (!data?.length) return <NoActivitiesPage />;

  const isMonthMode = periods.length > 0 ? periods[0].type === "month" : true;
  const labels =
    periods.length > 0 && !isMonthMode
      ? MONTH_LABELS_SHORT
      : ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

  const chartData = {
    labels,
    datasets: periods.map((period) => ({
      label: getPeriodLabel(period),
      data:
        period.type === "month" && period.month !== undefined
          ? getMonthCounts(activeData, period.year, period.month)
          : getYearCounts(activeData, period.year),
      borderColor: period.color,
      backgroundColor: period.color + "33",
      tension: 0.3,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        labels: {
          color: chartColors.foreground,
          usePointStyle: true,
          pointStyle: "circle" as const,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: chartColors.mutedForeground },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartColors.mutedForeground },
        grid: { display: false },
      },
    },
  } as const;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold heading-gradient">
          Compare Periods
        </h1>
        <p className="text-muted-foreground mt-1">
          Compare activity patterns across different time periods
        </p>
      </div>

      <PeriodSelector
        periods={periods}
        setPeriods={setPeriods}
        availableYears={availableYears}
      />

      {/* Chart & Metrics or Empty State */}
      {periods.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Activity Comparison</CardTitle>
              <CardDescription>
                {isMonthMode
                  ? "Weekly activity counts"
                  : "Monthly activity counts"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Line data={chartData} options={chartOptions} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => {
              const periodActivities = getPeriodActivities(activeData, period);
              const total = periodActivities.length;
              const mostPopular = getMostPopularActivity(activeData, period);

              return (
                <Card key={period.id} className="bloom-hover py-4 gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: period.color }}
                      />
                      {getPeriodLabel(period)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Activities
                      </span>
                      <span className="font-semibold tabular-nums">
                        {total}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Most Popular
                      </span>
                      <span className="font-semibold capitalize">
                        {mostPopular}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {period.type === "month" ? "Most Active Day" : "Most Active Month"}
                      </span>
                      <span className="font-semibold">
                        {getMostActiveTimeUnit(activeData, period)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="max-w-4xl">
          <CardContent className="flex flex-col items-center justify-center py-16 animate-fade-slide-up">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4">
              <GitCompare className="size-7 text-primary" />
            </div>
            <p className="text-lg font-medium">No periods selected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add periods above to start comparing
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
