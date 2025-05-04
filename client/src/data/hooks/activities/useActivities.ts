import { useIsFetching, useQuery, useQueryClient } from "react-query";
import type {
  ActivityRecordWithId,
  ActivityRecordWithIdServer,
} from "../../types";
import {
  activitiesApiPath,
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
} from "../../react-query-config/query-constants";
import type { HeadersPromise } from "../useRequestConfig";
import { useRequestConfig } from "../useRequestConfig";
import { useCallback } from "react";

export const useActivities = () => {
  const getConfig = useRequestConfig();
  return useQuery<ActivityRecordWithId[], Error>(getActivitiesQueryId, () =>
    fetchActivities(getConfig())
  );
};

export const useActivitiesWithLimit = () => {
  const getConfig = useRequestConfig();
  return useQuery(getActivitiesQueryIdWithLimit, () =>
    fetchActivities(getConfig(), 5)
  );
};

export const useExportActivities = (): (() => string) => {
  const client = useQueryClient();

  return useCallback(() => {
    const activities = client
      .getQueryData<ActivityRecordWithId[]>(getActivitiesQueryId)
      ?.map((activityRecord) => ({
        date: activityRecord.date.toLocaleDateString("en-CA"),
        name: activityRecord.name,
        active: activityRecord.active,
      }));
    return JSON.stringify(activities);
  }, [client]);
};

export const useIsFetchingActivties = () => {
  return useIsFetching(getActivitiesQueryId) > 0;
};

const fetchActivities = async (
  headersPromise: HeadersPromise,
  limit?: number
): Promise<ActivityRecordWithId[]> => {
  const headers = await headersPromise;

  const url = new URL(activitiesApiPath, window.location.origin);
  if (limit) {
    url.searchParams.append("limit", String(limit));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: headers,
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
