import type {
  ActivityRecord,
  Category,
  UserData,
  UserPreferences,
} from "./types";
import {
  validateActivityRecord,
  validateCategory,
  validatePreferences,
  type ValidationResultWithData,
} from "./validators";

export type BackupData = Omit<UserData, "preferences"> &
  Partial<Pick<UserData, "preferences">>;

export function isImportDataValid(data: unknown): boolean {
  return validateImportData(data).valid;
}

export const validateImportData = (
  body: unknown
): ValidationResultWithData<BackupData> => {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;

  if (
    !casted.activities ||
    typeof casted.activities !== "object" ||
    Array.isArray(casted.activities)
  ) {
    return { valid: false, error: "activities must be a non-array object" };
  }
  if (
    !casted.categories ||
    typeof casted.categories !== "object" ||
    Array.isArray(casted.categories)
  ) {
    return { valid: false, error: "categories must be a non-array object" };
  }

  const sanitizedActivities: Record<string, ActivityRecord> = {};
  for (const [key, activity] of Object.entries(casted.activities)) {
    const result = validateActivityRecord(activity);
    if (!result.valid) {
      return { valid: false, error: `Activity "${key}": ${result.error}` };
    }
    sanitizedActivities[key] = result.data!;
  }

  const sanitizedCategories: Record<string, Category> = {};
  for (const [key, category] of Object.entries(casted.categories)) {
    // Firebase omits empty arrays; old exports therefore may lack this field.
    const normalized =
      category && typeof category === "object" && !("activityNames" in category)
        ? { ...category, activityNames: [] }
        : category;
    const result = validateCategory(normalized);
    if (!result.valid) {
      return { valid: false, error: `Category "${key}": ${result.error}` };
    }
    sanitizedCategories[key] = result.data!;
  }

  let sanitizedPreferences: UserPreferences | undefined;
  if (casted.preferences !== undefined) {
    const prefsResult = validatePreferences(casted.preferences);
    if (!prefsResult.valid) {
      return { valid: false, error: `Preferences: ${prefsResult.error}` };
    }
    sanitizedPreferences = prefsResult.data;
  }

  return {
    valid: true,
    data: {
      activities: sanitizedActivities,
      categories: sanitizedCategories,
      ...(sanitizedPreferences !== undefined && {
        preferences: sanitizedPreferences,
      }),
    },
  };
};
