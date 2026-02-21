import { useIsFetching, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  activitiesQueryOptions,
  activitiesWithLimitQueryOptions,
} from "../../queryOptions";
import {
  exportApiPath,
  getActivitiesQueryId,
} from "../../react-query-config/query-constants";
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

export const useExportUserData = () => {
  const getConfig = useRequestConfig();

  return useCallback(async (): Promise<string> => {
    const config = await getConfig();
    const response = await fetch(exportApiPath, {
      method: "GET",
      headers: { "x-auth-token": config["x-auth-token"] },
    });
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    const data = await response.json();
    return JSON.stringify(data, null, 2);
  }, [getConfig]);
};

export const useIsFetchingActivities = () => {
  return useIsFetching({ queryKey: [...getActivitiesQueryId] }) > 0;
};
