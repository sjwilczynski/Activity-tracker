import { useIsFetching, useQuery, useQueryClient } from "react-query";
import {
  ActivityRecordWithId,
  ActivityRecordWithIdServer,
  Category,
} from "../types";
import axios from "axios";
import {
  activitiesApiPath,
  categoriesApiPath,
  getActivitiesQueryId,
  getCategoriesQueryId,
} from "../react-query-config/query-constants";
import { ConfigPromise, useRequestConfig } from "./useRequestConfig";
import { useCallback } from "react";

export const useActivities = () => {
  const getConfig = useRequestConfig();
  return useQuery<ActivityRecordWithId[], Error>(getActivitiesQueryId, () =>
    fetchActivities(getConfig())
  );
};

export const useCategories = () => {
  const getConfig = useRequestConfig();
  return useQuery<Category[], Error>(getCategoriesQueryId, () =>
    fetchCategories(getConfig())
  );
};

export const useActivitiesPrefetch = () => {
  const client = useQueryClient();
  const getConfig = useRequestConfig();
  client.prefetchQuery(getActivitiesQueryId, () =>
    fetchActivities(getConfig())
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
  configPromise: ConfigPromise
): Promise<ActivityRecordWithId[]> => {
  const config = await configPromise;
  const activityRecordsResponse = await axios.get<ActivityRecordWithIdServer[]>(
    activitiesApiPath,
    config
  );
  return activityRecordsResponse.data.map((activityRecord) => ({
    ...activityRecord,
    date: new Date(activityRecord.date),
  }));
};

const fetchCategories = async (
  configPromise: ConfigPromise
): Promise<Category[]> => {
  const config = await configPromise;
  const categoriesResponse = await axios.get<Category[]>(
    categoriesApiPath,
    config
  );
  return categoriesResponse.data;
};
