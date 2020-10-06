import { ActivityMap, ActivityRecord } from "../utils/types";

export type Database = {
  getActivities: (userId: string) => Promise<ActivityMap | null>;
  addActivities: (
    userId: string,
    activities: ActivityRecord[]
  ) => Promise<void>;
  editActivity: (
    userId: string,
    activityId: string,
    newActivity: ActivityRecord
  ) => Promise<void>;
  deleteActivity: (userId: string, activityId: string) => Promise<void>;
  deleteAllActivities: (userId: string) => Promise<void>;
};
