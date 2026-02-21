import { queryOptions } from "@tanstack/react-query";
import {
  activitiesApiPath,
  categoriesApiPath,
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
  getCategoriesQueryId,
} from "./react-query-config/query-constants";
import type {
  ActivityRecordFromQuery,
  ActivityRecordWithIdServer,
  Category,
} from "./types";

type GetAuthToken = () => Promise<string>;

const fetchActivities = async (
  getAuthToken: GetAuthToken,
  limit?: number
): Promise<ActivityRecordFromQuery[]> => {
  const token = await getAuthToken();

  const url = new URL(activitiesApiPath, window.location.origin);
  if (limit) {
    url.searchParams.append("limit", String(limit));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "x-auth-token": token },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

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
  const token = await getAuthToken();

  const response = await fetch(categoriesApiPath, {
    method: "GET",
    headers: { "x-auth-token": token },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

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
    queryKey: [...getActivitiesQueryIdWithLimit],
    queryFn: () => fetchActivities(getAuthToken, limit),
  });

export const categoriesQueryOptions = (getAuthToken: GetAuthToken) =>
  queryOptions({
    queryKey: [...getCategoriesQueryId],
    queryFn: () => fetchCategories(getAuthToken),
  });
