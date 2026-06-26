import { queryOptions } from "@tanstack/react-query";
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
  limit?: number
): Promise<ActivityRecordWithId[]> => {
  const url = new URL(activitiesApiPath, window.location.origin);
  if (limit) {
    url.searchParams.append("limit", String(limit));
  }

  const response = await apiFetch(getAuthToken, url.toString());

  const activityRecordsResponse =
    (await response.json()) as ActivityRecordWithIdServer[];

  return activityRecordsResponse.map((activityRecord) => ({
    ...activityRecord,
    date: new Date(activityRecord.date),
  }));
};

const fetchCategories = async (
  getAuthToken: GetAuthToken
): Promise<Category[]> => {
  const response = await apiFetch(getAuthToken, categoriesApiPath);

  return (await response.json()) as Category[];
};

export const activitiesQueryOptions = (getAuthToken: GetAuthToken) =>
  queryOptions({
    queryKey: [...getActivitiesQueryId],
    queryFn: () => fetchActivities(getAuthToken),
  });

export const activitiesWithLimitQueryOptions = (
  getAuthToken: GetAuthToken,
  limit = 5
) =>
  queryOptions({
    queryKey: [...getActivitiesQueryIdWithLimit, limit],
    queryFn: () => fetchActivities(getAuthToken, limit),
  });

export const categoriesQueryOptions = (getAuthToken: GetAuthToken) =>
  queryOptions({
    queryKey: [...getCategoriesQueryId],
    queryFn: () => fetchCategories(getAuthToken),
  });

const DEFAULT_PREFERENCES: UserPreferences = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

const fetchPreferences = async (
  getAuthToken: GetAuthToken
): Promise<UserPreferences> => {
  const response = await apiFetch(getAuthToken, preferencesApiPath, {
    allowNotOk: true,
  });

  if (!response.ok) {
    return DEFAULT_PREFERENCES;
  }

  return (await response.json()) as UserPreferences;
};

export const preferencesQueryOptions = (getAuthToken: GetAuthToken) =>
  queryOptions({
    queryKey: [...getPreferencesQueryId],
    queryFn: () => fetchPreferences(getAuthToken),
    staleTime: Infinity,
  });
