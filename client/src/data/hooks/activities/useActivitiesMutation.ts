import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import {
  getActivitiesQueryId,
  activitiesApiPath,
} from "../../react-query-config/query-constants";
import { ActivityRecordWithId, ActivityRecordServer } from "../../types";
import { useRequestConfig } from "../useRequestConfig";

export type ActivityMutationContext = {
  previousActivityRecords: ActivityRecordWithId[];
};

export const useActivitiesMutation = () => {
  const client = useQueryClient();
  const addActivities = useAddActivitiesFunction();
  return useMutation<
    string,
    Error,
    ActivityRecordServer[],
    ActivityMutationContext
  >(addActivities, {
    onMutate: (activityRecords) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      client.cancelQueries(getActivitiesQueryId, { exact: true });

      // Snapshot the previous value
      const previousActivityRecords =
        client.getQueryData<ActivityRecordWithId[]>(getActivitiesQueryId) || [];

      const newActivities: ActivityRecordWithId[] = activityRecords.map(
        (activityRecord: ActivityRecordServer, index: number) => ({
          ...activityRecord,
          date: new Date(activityRecord.date),
          id: `temporaryId${index}`,
        })
      );

      // Optimistically update to the new value
      client.setQueryData<ActivityRecordWithId[]>(
        getActivitiesQueryId,
        (old) => [...(old || []), ...newActivities]
      );

      // Return the snapshotted value
      return { previousActivityRecords };
    },
    // If the mutation fails, use the value returned from onMutate to roll back
    onError: (error, variables, context) => {
      if (context) {
        client.setQueryData(
          getActivitiesQueryId,
          context.previousActivityRecords
        );
      }
    },
    // Always refetch after error or success:
    onSettled: () =>
      client.invalidateQueries(getActivitiesQueryId, { exact: true }),
  });
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
