import axios from "axios";
import { useQueryClient, useMutation } from "react-query";
import {
  activitiesApiPath,
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
} from "../../react-query-config/query-constants";
import type { ActivityRecordWithId } from "../../types";
import { useRequestConfig } from "../useRequestConfig";
import type { ActivityMutationContext } from "./useActivitiesMutation";

export const useDeleteActivity = () => {
  const client = useQueryClient();
  const deleteActivity = useDeleteActivityFunction();
  return useMutation<void, Error, string, ActivityMutationContext>(
    deleteActivity,
    {
      onMutate: (activityId) => {
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
              queryId,
              previousFullRecords.filter(
                (activity) => activity.id !== activityId
              )
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

const useDeleteActivityFunction = () => {
  const getConfig = useRequestConfig();
  return async (activityId: string) => {
    const config = await getConfig();
    await axios.delete<string>(`${activitiesApiPath}\\${activityId}`, config);
  };
};
