import { useMutation, useQueryClient } from "react-query";
import { useRequestConfig } from "./useRequestConfig";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { ActivityRecordWithId } from "../types";

export const useDeleteAllActivities = () => {
  const client = useQueryClient();
  const deleteAllActivities = useDeleteAllActivitiesFunction();
  return useMutation<void, Error, {}, () => void>(deleteAllActivities, {
    onMutate: () => {
      client.cancelQueries(getActivitiesQueryId, { exact: true });

      const previousActivityRecords = client.getQueryData<
        ActivityRecordWithId[]
      >(getActivitiesQueryId);
      client.setQueryData<ActivityRecordWithId[], Error>(
        getActivitiesQueryId,
        []
      );
      return () =>
        client.setQueryData(getActivitiesQueryId, previousActivityRecords);
    },
    onError: (err, newTodo, rollback) => rollback(),
    onSettled: () =>
      client.invalidateQueries(getActivitiesQueryId, { exact: true }),
  });
};

const useDeleteAllActivitiesFunction = () => {
  const getConfig = useRequestConfig();
  return async () => {
    const config = await getConfig();
    await axios.delete<string>(activitiesApiPath, config);
  };
};
