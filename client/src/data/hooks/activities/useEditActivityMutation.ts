import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  activitiesApiPath,
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
} from "../../react-query-config/query-constants";
import type { ActivityRecordServer, ActivityRecordWithId } from "../../types";
import { useRequestConfig } from "../useRequestConfig";
import type { ActivityMutationContext } from "./useActivitiesMutation";

export const useEditActivityMutation = () => {
  const client = useQueryClient();
  const editActivityFunction = useEditActivityFunction();
  return useMutation<
    void,
    Error,
    { id: string } & { record: ActivityRecordServer },
    ActivityMutationContext
  >({
    mutationFn: ({ id, record }) => editActivityFunction(id, record),
    onMutate: ({ id, record }) => {
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
          client.cancelQueries({ queryKey: queryId, exact: true });

          const newActivity: ActivityRecordWithId = {
            ...record,
            date: new Date(record.date),
            id,
          };

          // Optimistically update to the new value
          client.setQueryData<ActivityRecordWithId[]>(queryId, (old) => [
            ...(old?.filter((record) => record.id !== newActivity.id) || []),
            ...[newActivity],
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
          client.invalidateQueries({ queryKey: queryId, exact: true });
        }
      ),
  });
};

const useEditActivityFunction = () => {
  const getConfig = useRequestConfig();
  return async (activityId: string, activityRecord: ActivityRecordServer) => {
    const headers = await getConfig();

    const url = `${activitiesApiPath}/${activityId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityRecord),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };
};
