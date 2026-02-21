export type Intensity = "low" | "medium" | "high";

export type Activity = {
  name: string;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  active: boolean;
  description: string;
  activityNames: string[];
};

export type CategoryOption = {
  name: string;
  active: boolean;
  categoryName: string;
  categoryId: string;
};

export type ActivityRecord = {
  date: Date;
  description?: string;
  intensity?: Intensity;
  timeSpent?: number;
} & Activity;

export type ActivityRecordServer = {
  date: string;
  description?: string;
  intensity?: Intensity;
  timeSpent?: number;
} & Activity;

/** Server now returns categoryId + active (computed from Category.activityNames) */
export type ActivityRecordWithIdServer = {
  id: string;
  active: boolean;
} & ActivityRecordServer;

/** Enriched activity with `active` from server */
export type ActivityRecordWithId = {
  id: string;
  active: boolean;
} & ActivityRecord;

export type ActivitySummary = {
  count: number;
  active: boolean;
};

export type ActivitySummaries = {
  [key: string]: ActivitySummary;
};

export type UserPreferences = {
  groupByCategory: boolean;
  funAnimations: boolean;
  isLightTheme: boolean;
};
