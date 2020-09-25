import { useMutation, useQueryCache } from "react-query";
import { ActivityRecord } from "../types";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { useRequestConfig } from "./useRequestConfig";

export const useActivityMutation = () => {
  const queryCache = useQueryCache();
  const addActivity = useAddActivityFunction();
  return useMutation<string, Error, ActivityRecord, () => void>(addActivity, {
    onMutate: (activityRecord) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      queryCache.cancelQueries(getActivitiesQueryId, { exact: true });

      // Snapshot the previous value
      const previousActivityRecords = queryCache.getQueryData<ActivityRecord[]>(
        getActivitiesQueryId
      );

      // Optimistically update to the new value
      queryCache.setQueryData<ActivityRecord[], Error>(
        getActivitiesQueryId,
        (old) => [...(old || []), activityRecord]
      );

      // Return the snapshotted value
      return () =>
        queryCache.setQueryData(getActivitiesQueryId, previousActivityRecords);
    },
    // If the mutation fails, use the value returned from onMutate to roll back
    onError: (err, newTodo, rollback) => rollback(),
    // Always refetch after error or success:
    onSettled: () =>
      queryCache.invalidateQueries(getActivitiesQueryId, { exact: true }),
  });
};

const useAddActivityFunction = () => {
  const getConfig = useRequestConfig();
  return async (activityRecord: ActivityRecord) => {
    const config = await getConfig();
    const response = await axios.post<string>(
      activitiesApiPath,
      activityRecord,
      config
    );
    return response.data;
  };
};
