import { format, isValid, parseISO } from "date-fns";
import { periodsFromParams, periodsToParam } from "../pages/compare-utils";

export type AppSearch = {
  startDate?: string;
  endDate?: string;
  periods?: string;
};

export function serializeDate(date: Date | null): string | undefined {
  return date && isValid(date) ? format(date, "yyyy-MM-dd") : undefined;
}

export function deserializeDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = parseISO(value);
  return isValid(date) && serializeDate(date) === value ? date : null;
}

export function validateAppSearch(search: Record<string, unknown>): AppSearch {
  const result = { ...search };
  const firstValue = (value: unknown): unknown =>
    Array.isArray(value) ? value[0] : value;
  for (const key of ["startDate", "endDate"] as const) {
    const value = firstValue(search[key]);
    result[key] =
      typeof value === "string" && deserializeDate(value) ? value : undefined;
  }
  const value = firstValue(search.periods);
  const periods =
    typeof value === "string" ? periodsToParam(periodsFromParams(value)) : "";
  // Router merges validation over raw search, so deletion would retain bad input.
  result.periods = periods || undefined;
  return result;
}

const destinations = new Set([
  "/",
  "/welcome",
  "/activity-list",
  "/charts",
  "/compare",
  "/settings",
]);

export function safeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/welcome";
  }
  try {
    const decoded = decodeURIComponent(value);
    if (
      decoded.includes("\\") ||
      decoded
        .split("")
        .some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
    ) {
      return "/welcome";
    }
    const url = new URL(value, "https://activity.local");
    if (
      url.origin !== "https://activity.local" ||
      !destinations.has(url.pathname)
    ) {
      return "/welcome";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/welcome";
  }
}
