import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  activitiesQueryOptions,
  activitiesWithLimitQueryOptions,
} from "../../queryOptions";
import { getActivitiesQueryId } from "../../react-query-config/query-constants";
import type {
  ActivityRecordFromQuery,
  ActivityRecordWithId,
  Category,
} from "../../types";
import { useCategories } from "../categories/useCategories";
import { useRequestConfig } from "../useRequestConfig";

function enrichWithActive(
  activities: ActivityRecordFromQuery[],
  categories: Category[]
): ActivityRecordWithId[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  return activities.map((activity) => {
    const category = categoryMap.get(activity.categoryId);
    return {
      ...activity,
      active: category?.active ?? true,
    };
  });
}

export const useActivities = () => {
  const getConfig = useRequestConfig();
  const getAuthToken = async () => (await getConfig())["x-auth-token"];
  const activitiesQuery = useQuery(activitiesQueryOptions(getAuthToken));
  const { data: categories } = useCategories();

  const data = useMemo(() => {
    if (!activitiesQuery.data) return undefined;
    return enrichWithActive(activitiesQuery.data, categories ?? []);
  }, [activitiesQuery.data, categories]);

  return {
    ...activitiesQuery,
    data,
  };
};

export const useActivitiesWithLimit = () => {
  const getConfig = useRequestConfig();
  const getAuthToken = async () => (await getConfig())["x-auth-token"];
  const activitiesQuery = useQuery(
    activitiesWithLimitQueryOptions(getAuthToken)
  );
  const { data: categories } = useCategories();

  const data = useMemo(() => {
    if (!activitiesQuery.data) return undefined;
    return enrichWithActive(activitiesQuery.data, categories ?? []);
  }, [activitiesQuery.data, categories]);

  return {
    ...activitiesQuery,
    data,
  };
};

export const useExportActivities = (): (() => string) => {
  const client = useQueryClient();

  return useCallback(() => {
    const activities = client
      .getQueryData<ActivityRecordFromQuery[]>([...getActivitiesQueryId])
      ?.map((activityRecord) => ({
        date: activityRecord.date.toLocaleDateString("en-CA"),
        name: activityRecord.name,
        categoryId: activityRecord.categoryId,
      }));
    return JSON.stringify(activities);
  }, [client]);
};

export const useIsFetchingActivities = () => {
  return useIsFetching({ queryKey: [...getActivitiesQueryId] }) > 0;
};
