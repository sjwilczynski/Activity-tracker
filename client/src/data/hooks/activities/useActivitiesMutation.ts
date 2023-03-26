import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import {
  getActivitiesQueryId,
  activitiesApiPath,
  getActivitiesQueryIdWithLimit,
} from "../../react-query-config/query-constants";
import type { ActivityRecordWithId, ActivityRecordServer } from "../../types";
import { useRequestConfig } from "../useRequestConfig";

export type ActivityMutationContext = {
  previousLimitedRecords: ActivityRecordWithId[];
  previousFullRecords: ActivityRecordWithId[];
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
      // Snapshot the previous value
      const previousFullRecords =
        client.getQueryData<ActivityRecordWithId[]>(getActivitiesQueryId) || [];
      const previousLimitedRecords =
        client.getQueryData<ActivityRecordWithId[]>(
          getActivitiesQueryIdWithLimit
        ) || [];
      [getActivitiesQueryId, getActivitiesQueryIdWithLimit].forEach(
        (queryId) => {
          // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
          client.cancelQueries(queryId, { exact: true });

          const newActivities: ActivityRecordWithId[] = activityRecords.map(
            (activityRecord: ActivityRecordServer, index: number) => ({
              ...activityRecord,
              date: new Date(activityRecord.date),
              id: `temporaryId${index}`,
            })
          );

          // Optimistically update to the new value
          client.setQueryData<ActivityRecordWithId[]>(queryId, (old) => [
            ...(old || []),
            ...newActivities,
          ]);
        }
      );

      // Return the snapshotted value
      return { previousFullRecords, previousLimitedRecords };
    },
    // If the mutation fails, use the value returned from onMutate to roll back
    onError: (_error, _variables, context) => {
      if (context) {
        client.setQueryData(getActivitiesQueryId, context.previousFullRecords);
        client.setQueryData(
          getActivitiesQueryIdWithLimit,
          context.previousLimitedRecords
        );
      }
    },
    // Always refetch after error or success:
    onSettled: () =>
      [getActivitiesQueryId, getActivitiesQueryIdWithLimit].forEach(
        (queryId) => {
          client.invalidateQueries(queryId, { exact: true });
        }
      ),
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
