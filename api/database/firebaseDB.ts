import { Database } from "./types";
import { database } from "../firebase/firebase";
import { ActivityMap, ActivityRecord } from "../utils/types";

const activityDocument = (userId: string): string =>
  `/users/${userId}/activity`;

export const firebaseDB: Database = {
  getActivities: async (userId: string) => {
    const activities = await database
      .ref(activityDocument(userId))
      .once("value");
    return activities.val() as ActivityMap;
  },
  addActivities: async (userId: string, activities: ActivityRecord[]) => {
    const activityDocumentPath = activityDocument(userId);
    const activitiesRef = database.ref(activityDocumentPath);
    const updates = {};
    for (let i = 0; i < activities.length; i++) {
      const newId = activitiesRef.push().key;
      if (newId === null) {
        throw new Error(`Unable to create new element at index ${i}`);
      } else {
        updates[newId] = activities[i];
      }
    }
    await activitiesRef.update(updates);
  },
  editActivity: async (
    userId: string,
    activityId: string,
    newActivity: ActivityRecord
  ) => {},
  deleteActivity: async (userId: string, activityId: string) => {},
  deleteAllActivities: async (userId: string) => {
    const activitiesRef = database.ref(activityDocument(userId));
    await activitiesRef.remove();
  },
};
