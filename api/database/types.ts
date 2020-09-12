import { ActivityRecord } from "../utils/types";

export interface Database {
  getActivities: (userId: string) => Promise<ActivityRecord[]>;
  addActivity: (userId: string, activity: ActivityRecord) => Promise<void>;
  editActivity: (
    userId: string,
    activityId: string,
    newActivity: ActivityRecord
  ) => Promise<void>;
  deleteActivity: (userId: string, activityId: string) => Promise<void>;
}
