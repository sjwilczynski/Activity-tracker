import { database } from "../firebase/firebase";
import {
  DEFAULT_PREFERENCES,
  type ActivityMap,
  type ActivityRecord,
  type CategoryMap,
  type UserPreferences,
} from "../utils/types";
import type { Database } from "./types";

const activityDocument = (userId: string): string =>
  `/users/${userId}/activity`;

const categoryDocument = (userId: string): string =>
  `/users/${userId}/categories`;

const preferencesDocument = (userId: string): string =>
  `/users/${userId}/preferences`;

const userDocument = (userId: string): string => `/users/${userId}`;

export const firebaseDB: Database = {
  getActivities: async (userId: string, limit?: number) => {
    const activitiesQuery = await database
      .ref(activityDocument(userId))
      .orderByChild("date");

    const limitedActivitiesQuery = await (
      limit ? activitiesQuery.limitToLast(limit) : activitiesQuery
    ).once("value");

    return limitedActivitiesQuery.val() as ActivityMap;
  },
  getActivityCount: async (userId: string) => {
    const snapshot = await database.ref(activityDocument(userId)).once("value");
    return snapshot.numChildren();
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
  getCategoryCount: async (userId: string) => {
    const snapshot = await database.ref(categoryDocument(userId)).once("value");
    return snapshot.numChildren();
  },
  addCategory: async (userId, category) => {
    const categoriesRef = database.ref(categoryDocument(userId));
    const newRef = categoriesRef.push();
    if (newRef.key === null) {
      throw new Error("Unable to add new category");
    }
    await newRef.set(category);
  },
  editCategory: async (userId, categoryId, newCategory) => {
    const categoryRef = database.ref(
      `${categoryDocument(userId)}/${categoryId}`
    );
    const category = await categoryRef.once("value");
    if (!category.exists()) {
      throw new Error(`Unable to find category with id ${categoryId}`);
    }
    await categoryRef.set(newCategory);
  },
  deleteCategory: async (userId, categoryId) => {
    const categoryRef = database.ref(
      `${categoryDocument(userId)}/${categoryId}`
    );
    const category = await categoryRef.once("value");
    if (!category.exists()) {
      throw new Error(`Unable to find category with id ${categoryId}`);
    }
    await categoryRef.remove();
  },
  deleteAllCategories: async (userId) => {
    const categoriesRef = database.ref(categoryDocument(userId));
    await categoriesRef.remove();
  },

  bulkRenameActivities: async (userId, oldName, newName) => {
    const activitiesRef = database.ref(activityDocument(userId));
    const snapshot = await activitiesRef.once("value");
    const activities = snapshot.val() as ActivityMap | null;
    if (!activities) return 0;

    const updates: Record<string, string> = {};
    for (const [key, activity] of Object.entries(activities)) {
      if (activity.name === oldName) {
        updates[`${key}/name`] = newName;
      }
    }
    if (Object.keys(updates).length > 0) {
      await activitiesRef.update(updates);
    }
    return Object.keys(updates).length;
  },

  bulkAssignCategory: async (userId, activityName, categoryId) => {
    const activitiesRef = database.ref(activityDocument(userId));
    const snapshot = await activitiesRef.once("value");
    const activities = snapshot.val() as ActivityMap | null;
    if (!activities) return 0;

    const updates: Record<string, string> = {};
    for (const [key, activity] of Object.entries(activities)) {
      if (activity.name === activityName) {
        updates[`${key}/categoryId`] = categoryId;
      }
    }
    if (Object.keys(updates).length > 0) {
      await activitiesRef.update(updates);
    }
    return Object.keys(updates).length;
  },

  bulkReassignCategory: async (userId, fromCategoryId, toCategoryId) => {
    const activitiesRef = database.ref(activityDocument(userId));
    const snapshot = await activitiesRef.once("value");
    const activities = snapshot.val() as ActivityMap | null;
    if (!activities) return 0;

    const updates: Record<string, string> = {};
    for (const [key, activity] of Object.entries(activities)) {
      if (activity.categoryId === fromCategoryId) {
        updates[`${key}/categoryId`] = toCategoryId;
      }
    }
    if (Object.keys(updates).length > 0) {
      await activitiesRef.update(updates);
    }
    return Object.keys(updates).length;
  },

  deleteActivitiesByCategory: async (userId, categoryId) => {
    const activitiesRef = database.ref(activityDocument(userId));
    const snapshot = await activitiesRef.once("value");
    const activities = snapshot.val() as ActivityMap | null;
    if (!activities) return 0;

    const updates: Record<string, null> = {};
    for (const [key, activity] of Object.entries(activities)) {
      if (activity.categoryId === categoryId) {
        updates[key] = null;
      }
    }
    if (Object.keys(updates).length > 0) {
      await activitiesRef.update(updates);
    }
    return Object.keys(updates).length;
  },

  getUserData: async (userId) => {
    const snapshot = await database.ref(userDocument(userId)).once("value");
    const data = snapshot.val() ?? {};
    return {
      activities: (data.activity ?? {}) as ActivityMap,
      categories: (data.categories ?? {}) as CategoryMap,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...((data.preferences ?? {}) as Partial<UserPreferences>),
      },
    };
  },

  setUserData: async (userId, data) => {
    const userRef = database.ref(userDocument(userId));
    await userRef.update({
      activity: data.activities,
      categories: data.categories,
      preferences: data.preferences,
    });
  },

  getPreferences: async (userId) => {
    const snapshot = await database
      .ref(preferencesDocument(userId))
      .once("value");
    const stored = (snapshot.val() ?? {}) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFERENCES, ...stored };
  },

  setPreferences: async (userId, preferences) => {
    await database.ref(preferencesDocument(userId)).set(preferences);
  },
};
