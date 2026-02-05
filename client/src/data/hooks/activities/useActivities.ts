import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  activitiesQueryOptions,
  activitiesWithLimitQueryOptions,
} from "../../queryOptions";
import { getActivitiesQueryId } from "../../react-query-config/query-constants";
import type { ActivityRecordWithId } from "../../types";
import { useRequestConfig } from "../useRequestConfig";

export const useActivities = () => {
  const getConfig = useRequestConfig();
  const getAuthToken = async () => (await getConfig())["x-auth-token"];
  return useQuery(activitiesQueryOptions(getAuthToken));
};

export const useActivitiesWithLimit = () => {
  const getConfig = useRequestConfig();
  const getAuthToken = async () => (await getConfig())["x-auth-token"];
  return useQuery(activitiesWithLimitQueryOptions(getAuthToken));
};

export const useExportActivities = (): (() => string) => {
  const client = useQueryClient();

  return useCallback(() => {
    const activities = client
      .getQueryData<ActivityRecordWithId[]>([...getActivitiesQueryId])
      ?.map((activityRecord) => ({
        date: activityRecord.date.toLocaleDateString("en-CA"),
        name: activityRecord.name,
        active: activityRecord.active,
      }));
    return JSON.stringify(activities);
  }, [client]);
};

export const useIsFetchingActivties = () => {
  return useIsFetching({ queryKey: [...getActivitiesQueryId] }) > 0;
};
