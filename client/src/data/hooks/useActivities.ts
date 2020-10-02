import { useQuery } from "react-query";
import { ActivityRecordWithId, ActivityRecordWithIdServer } from "../types";
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
      const activityRecordsResponse = await axios.get<
        ActivityRecordWithIdServer[]
      >(activitiesApiPath, config);
      return activityRecordsResponse.data.map((activityRecord) => {
        return {
          id: activityRecord.id,
          activity: activityRecord.activity,
          date: new Date(activityRecord.date),
        };
      });
    }
  );
};
