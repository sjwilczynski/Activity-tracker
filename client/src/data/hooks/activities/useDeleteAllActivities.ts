import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActivitiesQueryId,
  activitiesApiPath,
  getActivitiesQueryIdWithLimit,
} from "../../react-query-config/query-constants";
import type { ActivityRecordWithId } from "../../types";
import { useRequestConfig } from "../useRequestConfig";
import type { ActivityMutationContext } from "./useActivitiesMutation";

export const useDeleteAllActivities = () => {
  const client = useQueryClient();
  const deleteAllActivities = useDeleteAllActivitiesFunction();
  return useMutation<void, Error, void, ActivityMutationContext>({
    mutationFn: deleteAllActivities,
    onMutate: () => {
      const previousFullRecords =
        client.getQueryData<ActivityRecordWithId[]>(getActivitiesQueryId) || [];
      const previousLimitedRecords =
        client.getQueryData<ActivityRecordWithId[]>(
          getActivitiesQueryIdWithLimit
        ) || [];
      [getActivitiesQueryId, getActivitiesQueryIdWithLimit].forEach(
        (queryId) => {
          client.cancelQueries({ queryKey: queryId, exact: true });

          client.setQueryData<ActivityRecordWithId[]>(queryId, []);
        }
      );
      return { previousLimitedRecords, previousFullRecords };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        client.setQueryData(getActivitiesQueryId, context.previousFullRecords);
        client.setQueryData(
          getActivitiesQueryIdWithLimit,
          context.previousLimitedRecords
        );
      }
    },
    onSettled: () =>
      [getActivitiesQueryId, getActivitiesQueryIdWithLimit].forEach(
        (queryId) => {
          client.invalidateQueries({ queryKey: queryId, exact: true });
        }
      ),
  });
};

const useDeleteAllActivitiesFunction = () => {
  const getConfig = useRequestConfig();
  return async () => {
    const headers = await getConfig();

    const response = await fetch(activitiesApiPath, {
      method: "DELETE",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };
};
