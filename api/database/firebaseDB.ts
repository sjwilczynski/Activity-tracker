import { Database } from "./types";
import { database } from "../firebase/firebase";
import { ActivityRecord } from "../utils/types";

export const firebaseDB: Database = {
  getActivities: async (userId: string) => {
    const activities = await database.ref("/activities").once("value");
    return (activities as unknown) as ActivityRecord[];
  },
  addActivity: async (userId: string, activity: ActivityRecord) => {
    const activitiesRef = database.ref("/activities");
    const reference = await activitiesRef.push(activity);
  },
  editActivity: async (
    userId: string,
    activityId: string,
    newActivity: ActivityRecord
  ) => {},
  deleteActivity: async (userId: string, activityId: string) => {},
};
