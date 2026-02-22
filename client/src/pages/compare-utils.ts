import type { ActivityRecordWithId } from "../data";

export type ComparisonPeriod = {
  id: string;
  type: "month" | "year";
  year: number;
  month?: number;
  color: string;
};

export const PERIOD_COLORS = [
  "#D4764E",
  "#5085BE",
  "#1E7A4E",
  "#D4A03C",
  "#CD6078",
  "#5BA37C",
  "#8b5cf6",
];

export const MONTH_NAMES = [
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

export const MONTH_LABELS_SHORT = [
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

export function getAvailableYears(
  activities: ActivityRecordWithId[]
): number[] {
  const years = new Set(activities.map((a) => a.date.getFullYear()));
  return [...years].sort((a, b) => b - a);
}

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

export function getMonthCounts(
  activities: ActivityRecordWithId[],
  year: number,
  month: number
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

export function getYearCounts(
  activities: ActivityRecordWithId[],
  year: number
): number[] {
  const months = Array.from({ length: 12 }, () => 0);
  for (const a of activities) {
    if (a.date.getFullYear() === year) {
      months[a.date.getMonth()]++;
    }
  }
  return months;
}

export function getPeriodLabel(period: ComparisonPeriod): string {
  if (period.type === "month" && period.month !== undefined) {
    return `${MONTH_NAMES[period.month]} ${period.year}`;
  }
  return `${period.year}`;
}

export function getMostPopularActivity(
  activities: ActivityRecordWithId[],
  period: ComparisonPeriod
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

export function getPeriodActivities(
  activities: ActivityRecordWithId[],
  period: ComparisonPeriod
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

export function periodsFromParams(param: string | null): ComparisonPeriod[] {
  if (!param) return [];
  return param
    .split(",")
    .map(parsePeriodId)
    .filter((p): p is ComparisonPeriod => p !== null)
    .map((p, i) => ({ ...p, color: PERIOD_COLORS[i % PERIOD_COLORS.length] }));
}

export function periodsToParam(periods: ComparisonPeriod[]): string {
  return periods.map((p) => p.id).join(",");
}
