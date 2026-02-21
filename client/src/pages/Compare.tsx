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
import { GitCompare, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSearchParams } from "react-router";
import { ErrorView } from "../components/states/ErrorView";
import { Loading } from "../components/states/Loading";
import { NoActivitiesPage } from "../components/states/NoActivitiesPage";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useActivities } from "../data";
import type { ActivityRecordWithId } from "../data";
import { useChartColors } from "../utils/useChartColors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type ComparisonPeriod = {
  id: string;
  type: "month" | "year";
  year: number;
  month?: number;
  color: string;
};

const PERIOD_COLORS = [
  "#D4764E",
  "#5085BE",
  "#1E7A4E",
  "#D4A03C",
  "#CD6078",
  "#5BA37C",
  "#8b5cf6",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_LABELS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getAvailableYears(activities: ActivityRecordWithId[]): number[] {
  const years = new Set(activities.map((a) => a.date.getFullYear()));
  return [...years].sort((a, b) => b - a);
}

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

function getMonthCounts(
  activities: ActivityRecordWithId[],
  year: number,
  month: number,
): number[] {
  const weeks = [0, 0, 0, 0, 0];
  for (const a of activities) {
    if (a.date.getFullYear() === year && a.date.getMonth() === month) {
      const week = getWeekOfMonth(a.date);
      weeks[Math.min(week, 5) - 1]++;
    }
  }
  return weeks;
}

function getYearCounts(
  activities: ActivityRecordWithId[],
  year: number,
): number[] {
  const months = Array.from({ length: 12 }, () => 0);
  for (const a of activities) {
    if (a.date.getFullYear() === year) {
      months[a.date.getMonth()]++;
    }
  }
  return months;
}

function getPeriodLabel(period: ComparisonPeriod): string {
  if (period.type === "month" && period.month !== undefined) {
    return `${MONTH_NAMES[period.month]} ${period.year}`;
  }
  return `${period.year}`;
}

function getMostPopularActivity(
  activities: ActivityRecordWithId[],
  period: ComparisonPeriod,
): string {
  const counts: Record<string, number> = {};
  for (const a of activities) {
    const matchesYear = a.date.getFullYear() === period.year;
    const matchesMonth =
      period.type === "year" || a.date.getMonth() === period.month;
    if (matchesYear && matchesMonth) {
      counts[a.name] = (counts[a.name] || 0) + 1;
    }
  }
  const entries = Object.entries(counts);
  if (entries.length === 0) return "None";
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function getPeriodActivities(
  activities: ActivityRecordWithId[],
  period: ComparisonPeriod,
): ActivityRecordWithId[] {
  return activities.filter((a) => {
    const matchesYear = a.date.getFullYear() === period.year;
    const matchesMonth =
      period.type === "year" || a.date.getMonth() === period.month;
    return matchesYear && matchesMonth;
  });
}

function parsePeriodId(id: string): ComparisonPeriod | null {
  const parts = id.split("-");
  const type = parts[0] as "month" | "year";
  if (type !== "month" && type !== "year") return null;
  const year = Number(parts[1]);
  if (isNaN(year)) return null;
  if (type === "month") {
    const month = Number(parts[2]);
    if (isNaN(month) || month < 0 || month > 11) return null;
    return { id, type, year, month, color: "" };
  }
  return { id, type, year, color: "" };
}

function periodsFromParams(param: string | null): ComparisonPeriod[] {
  if (!param) return [];
  return param
    .split(",")
    .map(parsePeriodId)
    .filter((p): p is ComparisonPeriod => p !== null)
    .map((p, i) => ({ ...p, color: PERIOD_COLORS[i % PERIOD_COLORS.length] }));
}

function periodsToParam(periods: ComparisonPeriod[]): string {
  return periods.map((p) => p.id).join(",");
}

export const Compare = () => {
  const { isLoading, error, data } = useActivities();
  const [searchParams, setSearchParams] = useSearchParams();
  const chartColors = useChartColors();

  const periods = useMemo(
    () => periodsFromParams(searchParams.get("periods")),
    [searchParams],
  );

  const setPeriods = useCallback(
    (updater: ComparisonPeriod[] | ((prev: ComparisonPeriod[]) => ComparisonPeriod[])) => {
      setSearchParams((prev) => {
        const currentPeriods = periodsFromParams(prev.get("periods"));
        const next = typeof updater === "function" ? updater(currentPeriods) : updater;
        const params = new URLSearchParams(prev);
        if (next.length === 0) {
          params.delete("periods");
        } else {
          params.set("periods", periodsToParam(next));
        }
        return params;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const [comparisonType, setComparisonType] = useState<"month" | "year">(
    "month",
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<string>("");

  const availableYears = useMemo(
    () => (data ? getAvailableYears(data) : []),
    [data],
  );

  // Set default year when data loads
  useMemo(() => {
    if (availableYears.length > 0 && selectedYear === "") {
      setSelectedYear(String(availableYears[0]));
    }
  }, [availableYears, selectedYear]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorView error={error} />;
  if (!data?.length) return <NoActivitiesPage />;

  const activeData = data.filter((a) => a.active);

  const addPeriod = () => {
    if (periods.length >= 7) return;
    const year = Number(selectedYear);
    if (isNaN(year)) return;

    const id =
      comparisonType === "month"
        ? `${comparisonType}-${year}-${selectedMonth}`
        : `${comparisonType}-${year}`;

    if (periods.some((p) => p.id === id)) return;

    const color = PERIOD_COLORS[periods.length % PERIOD_COLORS.length];
    setPeriods([
      ...periods,
      {
        id,
        type: comparisonType,
        year,
        month: comparisonType === "month" ? selectedMonth : undefined,
        color,
      },
    ]);
  };

  const removePeriod = (id: string) => {
    setPeriods((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      return updated.map((p, i) => ({
        ...p,
        color: PERIOD_COLORS[i % PERIOD_COLORS.length],
      }));
    });
  };

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

      {/* Period Selector */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Select Periods to Compare</CardTitle>
          <CardDescription>
            Choose up to 7 periods to analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Comparison Type</Label>
              <Select
                value={comparisonType}
                onValueChange={(v) => setComparisonType(v as "month" | "year")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {comparisonType === "month" && (
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(v) => setSelectedMonth(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((name, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="invisible">Add</Label>
              <Button
                onClick={addPeriod}
                disabled={periods.length >= 7}
                className="w-full"
              >
                Add Period
              </Button>
            </div>
          </div>

          {periods.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Badge
                  key={period.id}
                  variant="secondary"
                  className="gap-1.5 pr-1"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: period.color }}
                  />
                  {getPeriodLabel(period)}
                  <button
                    onClick={() => removePeriod(period.id)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
              const periodActivities = getPeriodActivities(
                activeData,
                period,
              );
              const total = periodActivities.length;
              const mostPopular = getMostPopularActivity(
                activeData,
                period,
              );

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
