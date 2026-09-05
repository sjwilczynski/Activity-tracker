import type {
  Intensity,
  ActivityRecord as StoredActivityRecord,
  Category as StoredCategory,
} from "../../../shared/types";
export type { Intensity, UserPreferences } from "../../../shared/types";

export type Activity = {
  name: string;
  categoryId: string;
};

export type Category = StoredCategory & {
  id: string;
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

export type ActivityRecordServer = StoredActivityRecord & Activity;

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
