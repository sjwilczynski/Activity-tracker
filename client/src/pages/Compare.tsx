import { getRouteApi } from "@tanstack/react-router";
import { endOfDay } from "date-fns";
import { GitCompare } from "lucide-react";
import { ComparisonChart } from "@/components/visualization/Charts/ComparisonChart";
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
import type { ActivityRecordWithId } from "../data";
import { useActivities } from "../data";
import {
  type ComparisonPeriod,
  getAvailableYears,
  getMostPopularActivity,
  getPeriodActivities,
  getPeriodLabel,
  MONTH_LABELS_SHORT,
  MONTH_NAMES,
  periodsFromParams,
  periodsToParam,
} from "./compare-utils";
import { getComparisonSeries } from "./comparison-data";
import { PeriodSelector } from "./PeriodSelector";

function getMostActiveTimeUnit(
  periodActivities: ActivityRecordWithId[],
  period: ComparisonPeriod
): string {
  if (periodActivities.length === 0) return "None";

  if (period.type === "month") {
    const dayCounts: Record<number, number> = {};
    for (const a of periodActivities) {
      const day = a.date.getDate();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    const entries = Object.entries(dayCounts);
    entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    const day = Number(entries[0][0]);
    return `${MONTH_LABELS_SHORT[period.month ?? 0]} ${day}`;
  } else {
    const monthCounts: Record<number, number> = {};
    for (const a of periodActivities) {
      const month = a.date.getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
    const entries = Object.entries(monthCounts);
    entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    return MONTH_NAMES[Number(entries[0][0])];
  }
}

export const Compare = () => {
  const { isLoading, error, data } = useActivities();
  const search = getRouteApi("/_authenticated/compare").useSearch();
  const navigate = getRouteApi("/_authenticated/compare").useNavigate();
  const today = new Date();

  const periods = periodsFromParams(search.periods ?? null);

  const setPeriods = (
    updater:
      | ComparisonPeriod[]
      | ((prev: ComparisonPeriod[]) => ComparisonPeriod[])
  ) => {
    void navigate({
      search: (prev) => {
        const currentPeriods = periodsFromParams(prev.periods ?? null);
        const next =
          typeof updater === "function" ? updater(currentPeriods) : updater;
        return {
          ...prev,
          periods: next.length ? periodsToParam(next) : undefined,
        };
      },
      replace: true,
    });
  };

  const availableYears = data ? getAvailableYears(data) : [];

  const activeData = data
    ? data.filter((a) => a.active && a.date <= endOfDay(today))
    : [];

  if (isLoading) return <Loading />;
  if (error) return <ErrorView error={error} />;
  if (!data?.length) return <NoActivitiesPage />;

  const isMonthMode = periods.length > 0 ? periods[0].type === "month" : true;
  const series = getComparisonSeries(data, periods, today);

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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] xl:grid-cols-5">
          {/* Period cards: auto-placed into col 1, overflow wraps after chart */}
          {periods.map((period) => {
            const periodActivities = getPeriodActivities(activeData, period);
            const total = periodActivities.length;
            const mostPopular = getMostPopularActivity(activeData, period);

            return (
              <Card
                key={period.id}
                className="bloom-hover py-4 gap-2 col-span-1 row-span-1"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: period.color }}
                    />
                    {series.find((entry) => entry.id === period.id)?.name ??
                      getPeriodLabel(period)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Activities
                    </span>
                    <span className="font-semibold tabular-nums">{total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Most Popular</span>
                    <span className="font-semibold capitalize">
                      {mostPopular}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {period.type === "month"
                        ? "Most Active Day"
                        : "Most Active Month"}
                    </span>
                    <span className="font-semibold">
                      {getMostActiveTimeUnit(periodActivities, period)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Chart: explicit placement at col 2, height driven by card rows */}
          <Card className="-order-1 col-span-full md:order-0 md:col-[2/-1] md:row-start-1 md:row-end-3 lg:row-end-4 h-full max-w-250">
            <CardHeader>
              <CardTitle>Activity Comparison</CardTitle>
              <CardDescription>
                {isMonthMode
                  ? "Weekly activity counts"
                  : "Monthly activity counts"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <div className="h-full min-h-62.5">
                <ComparisonChart series={series} />
              </div>
            </CardContent>
          </Card>
        </div>
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
