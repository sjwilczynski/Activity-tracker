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
