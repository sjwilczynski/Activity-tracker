import { useQuery } from "react-query";
import { ActivityRecord } from "../types";
import axios from "axios";
import {
  activitiesApiPath,
  getActivitiesQueryId,
} from "../react-query-config/query-constants";
import { useRequestConfig } from "./useRequestConfig";

export const useActivities = () => {
  const getConfig = useRequestConfig();
  return useQuery<ActivityRecord[], Error>(getActivitiesQueryId, async () => {
    const config = await getConfig();
    const getResult = await axios.get<ActivityRecord[]>(
      activitiesApiPath,
      config
    );
    return Object.values(getResult.data);
  });
};
