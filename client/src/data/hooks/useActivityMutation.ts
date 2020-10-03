import { useMutation, useQueryCache } from "react-query";
import { ActivityRecordServer, ActivityRecordWithId } from "../types";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { useRequestConfig } from "./useRequestConfig";

export const useActivityMutation = () => {
  const queryCache = useQueryCache();
  const addActivity = useAddActivityFunction();
  return useMutation<string, Error, ActivityRecordServer, () => void>(
    addActivity,
    {
      onMutate: (activityRecord) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        queryCache.cancelQueries(getActivitiesQueryId, { exact: true });

        // Snapshot the previous value
        const previousActivityRecords = queryCache.getQueryData<
          ActivityRecordWithId[]
        >(getActivitiesQueryId);

        // Optimistically update to the new value
        queryCache.setQueryData<ActivityRecordWithId[], Error>(
          getActivitiesQueryId,
          (old) => [
            ...(old || []),
            {
              date: new Date(activityRecord.date),
              activity: activityRecord.activity,
              id: "temporaryId",
            },
          ]
        );

        // Return the snapshotted value
        return () =>
          queryCache.setQueryData(
            getActivitiesQueryId,
            previousActivityRecords
          );
      },
      // If the mutation fails, use the value returned from onMutate to roll back
      onError: (err, newTodo, rollback) => rollback(),
      // Always refetch after error or success:
      onSettled: () =>
        queryCache.invalidateQueries(getActivitiesQueryId, { exact: true }),
    }
  );
};

const useAddActivityFunction = () => {
  const getConfig = useRequestConfig();
  return async (activityRecord: ActivityRecordServer) => {
    const config = await getConfig();
    const response = await axios.post<string>(
      activitiesApiPath,
      activityRecord,
      config
    );
    return response.data;
  };
};
