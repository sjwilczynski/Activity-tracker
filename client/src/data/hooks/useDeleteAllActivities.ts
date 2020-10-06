import { useMutation, useQueryCache } from "react-query";
import { useRequestConfig } from "./useRequestConfig";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { ActivityRecordWithId } from "../types";

export const useDeleteAllActivities = () => {
  const queryCache = useQueryCache();
  const deleteAllActivities = useDeleteAllActivitiesFunction();
  return useMutation<void, Error, {}, () => void>(deleteAllActivities, {
    onMutate: () => {
      queryCache.cancelQueries(getActivitiesQueryId, { exact: true });

      const previousActivityRecords = queryCache.getQueryData<
        ActivityRecordWithId[]
      >(getActivitiesQueryId);
      queryCache.setQueryData<ActivityRecordWithId[], Error>(
        getActivitiesQueryId,
        []
      );
      return () =>
        queryCache.setQueryData(getActivitiesQueryId, previousActivityRecords);
    },
    onError: (err, newTodo, rollback) => rollback(),
    onSettled: () =>
      queryCache.invalidateQueries(getActivitiesQueryId, { exact: true }),
  });
};

const useDeleteAllActivitiesFunction = () => {
  const getConfig = useRequestConfig();
  return async () => {
    const config = await getConfig();
    await axios.delete<string>(activitiesApiPath, config);
  };
};
