import { useMutation, useQueryClient } from "react-query";
import { ActivityRecordServer, ActivityRecordWithId } from "../types";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { useRequestConfig } from "./useRequestConfig";

export const useActivitiesMutation = () => {
  const client = useQueryClient();
  const addActivities = useAddActivitiesFunction();
  return useMutation<string, Error, ActivityRecordServer[], () => void>(
    addActivities,
    {
      onMutate: (activityRecords) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        client.cancelQueries(getActivitiesQueryId, { exact: true });

        // Snapshot the previous value
        const previousActivityRecords = client.getQueryData<
          ActivityRecordWithId[]
        >(getActivitiesQueryId);

        const newActivities: ActivityRecordWithId[] = activityRecords.map(
          (activityRecord: ActivityRecordServer, index: number) => {
            return {
              ...activityRecord,
              date: new Date(activityRecord.date),
              id: `temporaryId${index}`,
            };
          }
        );

        // Optimistically update to the new value
        client.setQueryData<ActivityRecordWithId[], Error>(
          getActivitiesQueryId,
          (old) => [...(old || []), ...newActivities]
        );

        // Return the snapshotted value
        return () =>
          client.setQueryData(getActivitiesQueryId, previousActivityRecords);
      },
      // If the mutation fails, use the value returned from onMutate to roll back
      onError: (err, newTodo, rollback) => rollback(),
      // Always refetch after error or success:
      onSettled: () =>
        client.invalidateQueries(getActivitiesQueryId, { exact: true }),
    }
  );
};

const useAddActivitiesFunction = () => {
  const getConfig = useRequestConfig();
  return async (activityRecords: ActivityRecordServer[]) => {
    const config = await getConfig();
    const response = await axios.post<string>(
      activitiesApiPath,
      activityRecords,
      config
    );
    return response.data;
  };
};
