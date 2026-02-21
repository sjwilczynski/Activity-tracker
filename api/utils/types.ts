export type Intensity = "low" | "medium" | "high";

export type ActivityRecord = {
  date: string;
  name: string;
  categoryId: string;
  description?: string;
  intensity?: Intensity;
  timeSpent?: number;
};

export type ActivityMap = Record<string, ActivityRecord>;

export type Category = {
  name: string;
  active: boolean;
  description: string;
  activityNames: string[];
};

export type CategoryMap = Record<string, Category>;

export type UserPreferences = {
  groupByCategory: boolean;
  funAnimations: boolean;
  isLightTheme: boolean;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  groupByCategory: true,
  funAnimations: true,
  isLightTheme: true,
};

export type UserData = {
  activities: ActivityMap;
  categories: CategoryMap;
  preferences: UserPreferences;
};
