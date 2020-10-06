import { useQuery, useQueryCache } from "react-query";
import {
  ActivityRecordServer,
  ActivityRecordWithId,
  ActivityRecordWithIdServer,
} from "../types";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { ConfigPromise, useRequestConfig } from "./useRequestConfig";

export const useActivities = () => {
  const getConfig = useRequestConfig();
  return useQuery<ActivityRecordWithId[], Error>(getActivitiesQueryId, () =>
    fetchActivities(getConfig())
  );
};

export const useActivitiesPrefetch = () => {
  const cache = useQueryCache();
  const getConfig = useRequestConfig();
  cache.prefetchQuery(getActivitiesQueryId, () => fetchActivities(getConfig()));
};

export const useExportedActivities = (): ActivityRecordServer[] | undefined => {
  const queryCache = useQueryCache();
  const data = queryCache.getQueryData<ActivityRecordWithId[]>(
    getActivitiesQueryId
  );
  return data?.map((activityRecord) => {
    return {
      date: activityRecord.date.toLocaleDateString("en-CA"),
      name: activityRecord.name,
      active: activityRecord.active,
    };
  });
};

const fetchActivities = async (
  configPromise: ConfigPromise
): Promise<ActivityRecordWithId[]> => {
  const config = await configPromise;
  const activityRecordsResponse = await axios.get<ActivityRecordWithIdServer[]>(
    activitiesApiPath,
    config
  );
  return activityRecordsResponse.data.map((activityRecord) => {
    return {
      ...activityRecord,
      date: new Date(activityRecord.date),
    };
  });
};
