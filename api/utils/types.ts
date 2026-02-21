export type Intensity = "low" | "medium" | "high";

/** Stored in Firebase — no categoryId (derived from Category.activityNames) */
export type ActivityRecord = {
  date: string;
  name: string;
  description?: string;
  intensity?: Intensity;
  timeSpent?: number;
};

export type ActivityMap = Record<string, ActivityRecord>;

/** Returned by getActivities — enriched with computed categoryId + active */
export type EnrichedActivityRecord = ActivityRecord & {
  categoryId: string;
  active: boolean;
};

export type EnrichedActivityMap = Record<string, EnrichedActivityRecord>;

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
