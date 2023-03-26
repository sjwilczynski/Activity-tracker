import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
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
  return useMutation<void, Error, never, ActivityMutationContext>(
    deleteAllActivities,
    {
      onMutate: () => {
        const previousFullRecords =
          client.getQueryData<ActivityRecordWithId[]>(getActivitiesQueryId) ||
          [];
        const previousLimitedRecords =
          client.getQueryData<ActivityRecordWithId[]>(
            getActivitiesQueryIdWithLimit
          ) || [];
        [getActivitiesQueryId, getActivitiesQueryIdWithLimit].forEach(
          (queryId) => {
            client.cancelQueries(queryId, { exact: true });

            client.setQueryData<ActivityRecordWithId[]>(
              getActivitiesQueryId,
              []
            );
          }
        );
        return { previousLimitedRecords, previousFullRecords };
      },
      onError: (_error, _variables, context) => {
        if (context) {
          client.setQueryData(
            getActivitiesQueryId,
            context.previousFullRecords
          );
          client.setQueryData(
            getActivitiesQueryIdWithLimit,
            context.previousLimitedRecords
          );
        }
      },
      onSettled: () =>
        [getActivitiesQueryId, getActivitiesQueryIdWithLimit].forEach(
          (queryId) => {
            client.invalidateQueries(queryId, { exact: true });
          }
        ),
    }
  );
};

const useDeleteAllActivitiesFunction = () => {
  const getConfig = useRequestConfig();
  return async () => {
    const config = await getConfig();
    await axios.delete<string>(activitiesApiPath, config);
  };
};
