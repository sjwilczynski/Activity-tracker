import { useQuery } from "react-query";
import { ActivityRecordWithId } from "../types";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { useRequestConfig } from "./useRequestConfig";

export const useActivities = () => {
  const getConfig = useRequestConfig();
  return useQuery<ActivityRecordWithId[], Error>(
    getActivitiesQueryId,
    async () => {
      const config = await getConfig();
      const activityRecordsResponse = await axios.get<ActivityRecordWithId[]>(
        activitiesApiPath,
        config
      );
      return activityRecordsResponse.data;
    }
  );
};
