import type { Database } from "./types";
import { database } from "../firebase/firebase";
import type {
  ActivityMap,
  ActivityRecord,
  Category,
  CategoryMap,
} from "../utils/types";

const activityDocument = (userId: string): string =>
  `/users/${userId}/activity`;

const categoryDocument = (userId: string): string =>
  `/users/${userId}/categories`;

export const firebaseDB: Database = {
  getActivities: async (userId: string, limit?: number) => {
    const activitiesQuery = await database
      .ref(activityDocument(userId))
      .orderByChild("date");

    const limitedActivitiesQuery = await (limit
      ? activitiesQuery.limitToLast(limit)
      : activitiesQuery
    ).once("value");

    return limitedActivitiesQuery.val() as ActivityMap;
  },
  addActivities: async (userId: string, activities: ActivityRecord[]) => {
    const activityDocumentPath = activityDocument(userId);
    const activitiesRef = database.ref(activityDocumentPath);
    const updates: Record<string, ActivityRecord> = {};
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
  ) => {
    const activityDocumentPath = activityDocument(userId);
    const activityRef = database.ref(`${activityDocumentPath}/${activityId}`);
    const activity = await activityRef.once("value");
    if (!activity.exists()) {
      throw new Error(`Unable to find activity with id ${activityId}`);
    }
    await activityRef.update(newActivity);
  },
  deleteActivity: async (userId: string, activityId: string) => {
    const activityDocumentPath = activityDocument(userId);
    const activityRef = database.ref(`${activityDocumentPath}/${activityId}`);
    const activity = await activityRef.once("value");
    if (!activity.exists()) {
      throw new Error(`Unable to find activity with id ${activityId}`);
    }
    await activityRef.remove();
  },
  deleteAllActivities: async (userId: string) => {
    const activitiesRef = database.ref(activityDocument(userId));
    await activitiesRef.remove();
  },

  getCategories: async (userId: string) => {
    const categories = await database
      .ref(categoryDocument(userId))
      .once("value");
    return categories.val() as CategoryMap;
  },
  addCategory: async (userId: string, category: Category) => {
    const categoriesRef = database.ref(categoryDocument(userId));
    const newId = categoriesRef.push().key;
    if (newId === null) {
      throw new Error("Unable to add new category");
    } else {
      await categoriesRef.push({ ...category, id: newId });
    }
  },
  editCategory: async (
    userId: string,
    categoryName: string,
    newCategory: Category
  ) => {
    const categoryRef = database.ref(
      `${categoryDocument(userId)}/${categoryName}`
    );
    const category = await categoryRef.once("value");
    if (!category.exists()) {
      throw new Error(`Unable to find category with name ${categoryName}`);
    }
    await categoryRef.update(newCategory);
  },
  deleteCategory: async (userId: string, categoryName: string) => {
    const categoryRef = database.ref(
      `${categoryDocument(userId)}/${categoryName}`
    );
    const category = await categoryRef.once("value");
    if (!category.exists()) {
      throw new Error(`Unable to find category with name ${categoryName}`);
    }
    await categoryRef.remove();
  },
  deleteAllCategories: async (userId) => {
    const categoriesRef = database.ref(categoryDocument(userId));
    await categoriesRef.remove();
  },
};
