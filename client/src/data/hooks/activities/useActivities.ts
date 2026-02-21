import { useIsFetching, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  activitiesQueryOptions,
  activitiesWithLimitQueryOptions,
} from "../../queryOptions";
import {
  exportApiPath,
  getActivitiesQueryId,
} from "../../react-query-config/query-constants";
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
