import { useMutation, useQueryClient } from "react-query";
import { useRequestConfig } from "./useRequestConfig";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { ActivityRecordWithId } from "../types";
import { ActivityMutationContext } from "./useActivitiesMutation";

export const useDeleteAllActivities = () => {
  const client = useQueryClient();
  const deleteAllActivities = useDeleteAllActivitiesFunction();
  return useMutation<void, Error, {}, ActivityMutationContext>(
    deleteAllActivities,
    {
      onMutate: () => {
        client.cancelQueries(getActivitiesQueryId, { exact: true });

        const previousActivityRecords =
          client.getQueryData<ActivityRecordWithId[]>(getActivitiesQueryId) ||
          [];
        client.setQueryData<ActivityRecordWithId[]>(getActivitiesQueryId, []);
        return { previousActivityRecords };
      },
      onError: (error, variables, context) => {
        if (context) {
          client.setQueryData(
            getActivitiesQueryId,
            context.previousActivityRecords
          );
        }
      },
      onSettled: () =>
        client.invalidateQueries(getActivitiesQueryId, { exact: true }),
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
