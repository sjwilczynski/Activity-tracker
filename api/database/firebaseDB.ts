import { Database } from "./types";
import { database } from "../firebase/firebase";
import { ActivityMap, ActivityRecord } from "../utils/types";

const activityDocument = (userId: string) => `/users/${userId}/activity`;

export const firebaseDB: Database = {
  getActivities: async (userId: string) => {
    const activities = await database
      .ref(activityDocument(userId))
      .once("value");
    return activities.val() as ActivityMap;
  },
  addActivity: async (userId: string, activity: ActivityRecord) => {
    const activitiesRef = database.ref(activityDocument(userId));
    const reference = await activitiesRef.push(activity);
  },
  editActivity: async (
    userId: string,
    activityId: string,
    newActivity: ActivityRecord
  ) => {},
  deleteActivity: async (userId: string, activityId: string) => {},
};
