import { database } from "../firebase/firebase";
import {
  DEFAULT_PREFERENCES,
  type ActivityMap,
  type ActivityRecord,
  type CategoryMap,
  type EnrichedActivityMap,
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

/**
 * Build a name → { categoryId, active } map from categories' activityNames.
 * This is the single source of truth for which category an activity belongs to.
 */
function buildNameToCategoryMap(
  categories: CategoryMap | null
): Map<string, { categoryId: string; active: boolean }> {
  const map = new Map<string, { categoryId: string; active: boolean }>();
  if (!categories) return map;
  for (const [categoryId, category] of Object.entries(categories)) {
    for (const name of category.activityNames ?? []) {
      map.set(name, { categoryId, active: category.active });
    }
  }
  return map;
}

/**
 * Enrich raw activities with computed categoryId + active from categories.
 */
function enrichActivities(
  activities: ActivityMap,
  categories: CategoryMap | null
): EnrichedActivityMap {
  const nameMap = buildNameToCategoryMap(categories);
  const enriched: EnrichedActivityMap = {};
  for (const [id, activity] of Object.entries(activities)) {
    const mapping = nameMap.get(activity.name);
    enriched[id] = {
      ...activity,
      categoryId: mapping?.categoryId ?? "",
      active: mapping?.active ?? true,
    };
  }
  return enriched;
}

export const firebaseDB: Database = {
  getActivities: async (userId: string, limit?: number) => {
    const activitiesQuery = await database
      .ref(activityDocument(userId))
      .orderByChild("date");

    const limitedActivitiesQuery = await (
      limit ? activitiesQuery.limitToLast(limit) : activitiesQuery
    ).once("value");

    const rawActivities = limitedActivitiesQuery.val() as ActivityMap | null;
    if (!rawActivities) return null;

    const categories = await database
      .ref(categoryDocument(userId))
      .once("value");
    const categoryMap = categories.val() as CategoryMap | null;

    return enrichActivities(rawActivities, categoryMap);
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
    // 1. Rename in activity records
    const activitiesRef = database.ref(activityDocument(userId));
    const snapshot = await activitiesRef.once("value");
    const activities = snapshot.val() as ActivityMap | null;

    const activityUpdates: Record<string, string> = {};
    if (activities) {
      for (const [key, activity] of Object.entries(activities)) {
        if (activity.name === oldName) {
          activityUpdates[`${key}/name`] = newName;
        }
      }
      if (Object.keys(activityUpdates).length > 0) {
        await activitiesRef.update(activityUpdates);
      }
    }

    // 2. Update category activityNames
    const categoriesRef = database.ref(categoryDocument(userId));
    const catSnapshot = await categoriesRef.once("value");
    const categories = catSnapshot.val() as CategoryMap | null;
    if (categories) {
      for (const [catId, cat] of Object.entries(categories)) {
        const idx = (cat.activityNames ?? []).indexOf(oldName);
        if (idx !== -1) {
          const newNames = [...cat.activityNames];
          newNames[idx] = newName;
          await categoriesRef
            .child(catId)
            .child("activityNames")
            .set(newNames);
          break; // a name should only be in one category
        }
      }
    }

    return Object.keys(activityUpdates).length;
  },

  bulkAssignCategory: async (userId, activityName, categoryId) => {
    const categoriesRef = database.ref(categoryDocument(userId));
    const catSnapshot = await categoriesRef.once("value");
    const categories = catSnapshot.val() as CategoryMap | null;
    if (!categories) return;

    // Remove from current category
    for (const [catId, cat] of Object.entries(categories)) {
      const names = cat.activityNames ?? [];
      const idx = names.indexOf(activityName);
      if (idx !== -1) {
        const newNames = names.filter((n) => n !== activityName);
        await categoriesRef.child(catId).child("activityNames").set(newNames);
        break;
      }
    }

    // Add to target category
    const targetCat = categories[categoryId];
    if (targetCat) {
      const targetNames = targetCat.activityNames ?? [];
      if (!targetNames.includes(activityName)) {
        await categoriesRef
          .child(categoryId)
          .child("activityNames")
          .set([...targetNames, activityName]);
      }
    }
  },

  bulkReassignCategory: async (userId, fromCategoryId, toCategoryId) => {
    const categoriesRef = database.ref(categoryDocument(userId));
    const catSnapshot = await categoriesRef.once("value");
    const categories = catSnapshot.val() as CategoryMap | null;
    if (!categories) return;

    const fromCat = categories[fromCategoryId];
    const toCat = categories[toCategoryId];
    if (!fromCat || !toCat) return;

    const namesToMove = fromCat.activityNames ?? [];
    if (namesToMove.length === 0) return;

    // Move all names from source to target (deduplicate)
    const targetNames = [
      ...new Set([...(toCat.activityNames ?? []), ...namesToMove]),
    ];
    await categoriesRef
      .child(toCategoryId)
      .child("activityNames")
      .set(targetNames);
    await categoriesRef
      .child(fromCategoryId)
      .child("activityNames")
      .set([]);
  },

  deleteActivitiesByCategory: async (userId, categoryId) => {
    // Look up which activity names belong to this category
    const categoriesRef = database.ref(categoryDocument(userId));
    const catSnapshot = await categoriesRef.once("value");
    const categories = catSnapshot.val() as CategoryMap | null;
    if (!categories || !categories[categoryId]) return 0;

    const activityNamesInCategory = new Set(
      categories[categoryId].activityNames ?? []
    );
    if (activityNamesInCategory.size === 0) return 0;

    // Delete matching activity records
    const activitiesRef = database.ref(activityDocument(userId));
    const snapshot = await activitiesRef.once("value");
    const activities = snapshot.val() as ActivityMap | null;
    if (!activities) return 0;

    const updates: Record<string, null> = {};
    for (const [key, activity] of Object.entries(activities)) {
      if (activityNamesInCategory.has(activity.name)) {
        updates[key] = null;
      }
    }
    if (Object.keys(updates).length > 0) {
      await activitiesRef.update(updates);
    }
    return Object.keys(updates).length;
  },

  addActivityNameToCategory: async (userId, categoryId, activityName) => {
    const categoriesRef = database.ref(categoryDocument(userId));
    const catSnapshot = await categoriesRef.once("value");
    const categories = catSnapshot.val() as CategoryMap | null;
    if (!categories) {
      throw new Error("No categories found");
    }

    // Validate not already in another category
    for (const [catId, cat] of Object.entries(categories)) {
      if ((cat.activityNames ?? []).includes(activityName)) {
        if (catId === categoryId) return; // already in target, no-op
        throw new Error(
          `Activity name "${activityName}" already belongs to category "${cat.name}"`
        );
      }
    }

    const targetCat = categories[categoryId];
    if (!targetCat) {
      throw new Error(`Category ${categoryId} not found`);
    }

    const newNames = [...(targetCat.activityNames ?? []), activityName];
    await categoriesRef.child(categoryId).child("activityNames").set(newNames);
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
