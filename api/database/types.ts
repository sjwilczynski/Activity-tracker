import { ActivityMap, ActivityRecord } from "../utils/types";

export type Database = {
  getActivities: (userId: string) => Promise<ActivityMap | null>;
  addActivity: (userId: string, activity: ActivityRecord) => Promise<void>;
  editActivity: (
    userId: string,
    activityId: string,
    newActivity: ActivityRecord
  ) => Promise<void>;
  deleteActivity: (userId: string, activityId: string) => Promise<void>;
  deleteAllActivities: (userId: string) => Promise<void>;
};
