import type {
  ActivityMap,
  ActivityRecord,
  Category,
  CategoryMap,
  UserData,
  UserPreferences,
} from "../utils/types";

export type Database = {
  getActivities: (
    userId: string,
    limit?: number
  ) => Promise<ActivityMap | null>;
  getActivityCount: (userId: string) => Promise<number>;
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

  getCategories: (userId: string) => Promise<CategoryMap | null>;
  getCategoryCount: (userId: string) => Promise<number>;
  addCategory: (userId: string, category: Category) => Promise<void>;
  editCategory: (
    userId: string,
    categoryId: string,
    newCategory: Category
  ) => Promise<void>;
  deleteCategory: (userId: string, categoryId: string) => Promise<void>;
  deleteAllCategories: (userId: string) => Promise<void>;

  // Bulk operations
  bulkRenameActivities: (
    userId: string,
    oldName: string,
    newName: string
  ) => Promise<number>;
  bulkAssignCategory: (
    userId: string,
    activityName: string,
    categoryId: string
  ) => Promise<number>;
  bulkReassignCategory: (
    userId: string,
    fromCategoryId: string,
    toCategoryId: string
  ) => Promise<number>;
  deleteActivitiesByCategory: (
    userId: string,
    categoryId: string
  ) => Promise<number>;

  // User data (export/import)
  getUserData: (userId: string) => Promise<UserData>;
  setUserData: (userId: string, data: UserData) => Promise<void>;

  // Preferences
  getPreferences: (userId: string) => Promise<UserPreferences>;
  setPreferences: (
    userId: string,
    preferences: UserPreferences
  ) => Promise<void>;
};
