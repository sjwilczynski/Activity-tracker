import { isMatch } from "date-fns";
import type { ActivityRecordServer, UserPreferences } from "../types";

type ImportCategory = {
  name: string;
  active: boolean;
  description: string;
  activityNames: string[];
};

type ImportData = {
  activities: Record<string, ActivityRecordServer>;
  categories: Record<string, ImportCategory>;
  preferences?: UserPreferences;
};

export const isImportDataValid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): data is ImportData => {
  if (!data || typeof data !== "object") {
    return false;
  }

  const { activities, categories } = data;

  if (
    !activities ||
    typeof activities !== "object" ||
    Object.keys(activities).length === 0
  ) {
    return false;
  }

  if (!categories || typeof categories !== "object") {
    return false;
  }

  if (
    !Object.values(activities).every((a) => isActivityValid(a as unknown))
  ) {
    return false;
  }

  if (!Object.values(categories).every((c) => isCategoryValid(c as unknown))) {
    return false;
  }

  if (data.preferences !== undefined && !isPreferencesValid(data.preferences)) {
    return false;
  }

  return true;
};

const isActivityValid = (
  activity: unknown
): activity is ActivityRecordServer => {
  const castedActivity = activity as ActivityRecordServer;
  if (castedActivity == null || castedActivity === undefined) {
    return false;
  }

  if (!isMatch(castedActivity.date, "yyyy-MM-dd")) {
    return false;
  }

  const { name, categoryId } = castedActivity;
  if (
    typeof name !== "string" ||
    !isValidName(name) ||
    typeof categoryId !== "string" ||
    !categoryId
  ) {
    return false;
  }

  return true;
};

const isValidName = (name: string): boolean => {
  return Boolean(name);
};

const isCategoryValid = (category: unknown): category is ImportCategory => {
  if (category == null) return false;
  const c = category as ImportCategory;
  return (
    typeof c.name === "string" &&
    isValidName(c.name) &&
    typeof c.active === "boolean" &&
    typeof c.description === "string" &&
    Array.isArray(c.activityNames) &&
    c.activityNames.every((n) => typeof n === "string")
  );
};

const isPreferencesValid = (prefs: unknown): prefs is UserPreferences => {
  if (prefs == null || typeof prefs !== "object") return false;
  const p = prefs as UserPreferences;
  return (
    typeof p.groupByCategory === "boolean" &&
    typeof p.funAnimations === "boolean" &&
    typeof p.isLightTheme === "boolean"
  );
};
