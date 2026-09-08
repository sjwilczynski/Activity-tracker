import { queryOptions } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { apiFetch, type GetAuthToken } from "./apiClient";
import {
  activitiesApiPath,
  categoriesApiPath,
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
  getCategoriesQueryId,
  getPreferencesQueryId,
  preferencesApiPath,
} from "./react-query-config/query-constants";
import type {
  ActivityRecordWithId,
  ActivityRecordWithIdServer,
  Category,
  UserPreferences,
} from "./types";

const fetchActivities = async (
  getAuthToken: GetAuthToken,
  limit?: number,
  signal?: AbortSignal
): Promise<ActivityRecordWithId[]> => {
  const url = new URL(activitiesApiPath, window.location.origin);
  if (limit) {
    url.searchParams.append("limit", String(limit));
  }

  const response = await apiFetch(getAuthToken, url.toString(), { signal });

  const activityRecordsResponse =
    (await response.json()) as ActivityRecordWithIdServer[];

  return activityRecordsResponse.map((activityRecord) => ({
    ...activityRecord,
    // Parse date-only strings (yyyy-MM-dd) as LOCAL dates. `new Date(str)`
    // would treat them as UTC midnight, shifting them to the previous day in
    // timezones west of UTC and bucketing them into the wrong local week.
    date: parseISO(activityRecord.date),
  }));
};

const fetchCategories = async (
  getAuthToken: GetAuthToken,
  signal?: AbortSignal
): Promise<Category[]> => {
  const response = await apiFetch(getAuthToken, categoriesApiPath, { signal });

  return (await response.json()) as Category[];
};

export const activitiesQueryOptions = (getAuthToken: GetAuthToken) =>
  queryOptions({
    queryKey: [...getActivitiesQueryId],
    queryFn: ({ signal }) => fetchActivities(getAuthToken, undefined, signal),
    staleTime: 10 * 60_000,
  });

export const activitiesWithLimitQueryOptions = (
  getAuthToken: GetAuthToken,
  limit = 5
) =>
  queryOptions({
    queryKey: [...getActivitiesQueryIdWithLimit, limit],
    queryFn: ({ signal }) => fetchActivities(getAuthToken, limit, signal),
    staleTime: 10 * 60_000,
  });

export const categoriesQueryOptions = (getAuthToken: GetAuthToken) =>
  queryOptions({
    queryKey: [...getCategoriesQueryId],
    queryFn: ({ signal }) => fetchCategories(getAuthToken, signal),
    staleTime: 10 * 60_000,
  });

const DEFAULT_PREFERENCES: UserPreferences = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

const fetchPreferences = async (
  getAuthToken: GetAuthToken,
  signal?: AbortSignal
): Promise<UserPreferences> => {
  const response = await apiFetch(getAuthToken, preferencesApiPath, {
    allowNotOk: true,
    signal,
  });

  if (response.status === 404) {
    return DEFAULT_PREFERENCES;
  }
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  return (await response.json()) as UserPreferences;
};

export const preferencesQueryOptions = (getAuthToken: GetAuthToken) =>
  queryOptions({
    queryKey: [...getPreferencesQueryId],
    queryFn: ({ signal }) => fetchPreferences(getAuthToken, signal),
    staleTime: Infinity,
  });
