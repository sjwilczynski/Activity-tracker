import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import {
  getActivitiesQueryId,
  activitiesApiPath,
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
        client.cancelQueries(getActivitiesQueryId, { exact: true });

        const previousActivityRecords =
          client.getQueryData<ActivityRecordWithId[]>(getActivitiesQueryId) ||
          [];
        client.setQueryData<ActivityRecordWithId[]>(getActivitiesQueryId, []);
        return { previousActivityRecords };
      },
      onError: (_error, _variables, context) => {
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
