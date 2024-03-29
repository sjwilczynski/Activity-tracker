import type {
  ActivityMap,
  ActivityRecord,
  Category,
  CategoryMap,
} from "../utils/types";

export type Database = {
  getActivities: (
    userId: string,
    limit?: number
  ) => Promise<ActivityMap | null>;
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
  addCategory: (userId: string, category: Category) => Promise<void>;
  editCategory: (
    userId: string,
    categoryName: string,
    newCategory: Category
  ) => Promise<void>;
  deleteCategory: (userId: string, categoryName: string) => Promise<void>;
  deleteAllCategories: (userId: string) => Promise<void>;
};
