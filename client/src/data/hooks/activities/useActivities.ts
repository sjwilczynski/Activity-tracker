import { useIsFetching, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
  exportApiPath,
  getActivitiesQueryId,
} from "../../react-query-config/query-constants";
import { useRequestConfig } from "../useRequestConfig";

export const useActivities = () => {
  const { activitiesQuery } = getRouteApi("/_authenticated").useRouteContext();
  return useQuery(activitiesQuery);
};

export const useExportUserData = () => {
  const getConfig = useRequestConfig();

  return async (): Promise<string> => {
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
  };
};

export const useIsFetchingActivities = () => {
  return useIsFetching({ queryKey: [...getActivitiesQueryId] }) > 0;
};
