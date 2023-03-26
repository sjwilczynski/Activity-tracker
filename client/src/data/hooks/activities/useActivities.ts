import { useIsFetching, useQuery, useQueryClient } from "react-query";
import type {
  ActivityRecordWithId,
  ActivityRecordWithIdServer,
} from "../../types";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
} from "../../react-query-config/query-constants";
import type { ConfigPromise } from "../useRequestConfig";
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
  configPromise: ConfigPromise,
  limit?: number
): Promise<ActivityRecordWithId[]> => {
  const config = await configPromise;
  const params = limit ? { params: { limit } } : {};
  const activityRecordsResponse = await axios.get<ActivityRecordWithIdServer[]>(
    activitiesApiPath,
    { ...config, ...params }
  );
  return activityRecordsResponse.data.map((activityRecord) => ({
    ...activityRecord,
    date: new Date(activityRecord.date),
  }));
};
