import type {
  ActivityRecord,
  Category,
  Intensity,
  UserPreferences,
} from "../utils/types";
import { LIMITS } from "./constants";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_INTENSITIES: Intensity[] = ["low", "medium", "high"];

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export type ValidationResultWithData<T> =
  | { valid: true; data: T }
  | { valid: false; error: string };

export const validateActivityName = (name: unknown): ValidationResult => {
  if (typeof name !== "string") {
    return { valid: false, error: "Activity name must be a string" };
  }
  if (!name.trim()) {
    return { valid: false, error: "Activity name cannot be empty" };
  }
  if (name.length > LIMITS.ACTIVITY_NAME_MAX) {
    return {
      valid: false,
      error: `Activity name exceeds ${LIMITS.ACTIVITY_NAME_MAX} characters`,
    };
  }
  return { valid: true };
};

export const validateCategoryId = (categoryId: unknown): ValidationResult => {
  if (typeof categoryId !== "string") {
    return { valid: false, error: "Category ID must be a string" };
  }
  if (!categoryId.trim()) {
    return { valid: false, error: "Category ID cannot be empty" };
  }
  return { valid: true };
};

export const validateIntensity = (intensity: unknown): ValidationResult => {
  if (!VALID_INTENSITIES.includes(intensity as Intensity)) {
    return {
      valid: false,
      error: `Intensity must be one of: ${VALID_INTENSITIES.join(", ")}`,
    };
  }
  return { valid: true };
};

export const validateTimeSpent = (timeSpent: unknown): ValidationResult => {
  if (typeof timeSpent !== "number") {
    return { valid: false, error: "Time spent must be a number" };
  }
  if (!Number.isFinite(timeSpent) || timeSpent < 0) {
    return { valid: false, error: "Time spent must be a non-negative number" };
  }
  if (timeSpent > LIMITS.MAX_TIME_SPENT) {
    return {
      valid: false,
      error: `Time spent exceeds ${LIMITS.MAX_TIME_SPENT} minutes`,
    };
  }
  return { valid: true };
};

export const validateActivityRecord = (
  activity: unknown
): ValidationResult & { data?: ActivityRecord } => {
  if (activity === null || activity === undefined) {
    return { valid: false, error: "Activity cannot be null or undefined" };
  }

  const castedActivity = activity as ActivityRecord;

  if (
    typeof castedActivity.date !== "string" ||
    !DATE_REGEX.test(castedActivity.date)
  ) {
    return {
      valid: false,
      error: "Activity date must be in YYYY-MM-DD format",
    };
  }

  const nameValidation = validateActivityName(castedActivity.name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  const categoryIdValidation = validateCategoryId(castedActivity.categoryId);
  if (!categoryIdValidation.valid) {
    return categoryIdValidation;
  }

  if (castedActivity.description !== undefined) {
    const descResult = validateDescription(
      castedActivity.description,
      "Activity description"
    );
    if (!descResult.valid) {
      return descResult;
    }
  }

  if (castedActivity.intensity !== undefined) {
    const intensityResult = validateIntensity(castedActivity.intensity);
    if (!intensityResult.valid) {
      return intensityResult;
    }
  }

  if (castedActivity.timeSpent !== undefined) {
    const timeSpentResult = validateTimeSpent(castedActivity.timeSpent);
    if (!timeSpentResult.valid) {
      return timeSpentResult;
    }
  }

  const data: ActivityRecord = {
    date: castedActivity.date,
    name: castedActivity.name,
    categoryId: castedActivity.categoryId,
  };
  if (castedActivity.description !== undefined) {
    data.description = castedActivity.description;
  }
  if (castedActivity.intensity !== undefined) {
    data.intensity = castedActivity.intensity;
  }
  if (castedActivity.timeSpent !== undefined) {
    data.timeSpent = castedActivity.timeSpent;
  }

  return { valid: true, data };
};

export const validateActivityBatch = (
  activities: unknown
): ValidationResult & { data?: ActivityRecord[] } => {
  if (!Array.isArray(activities)) {
    return { valid: false, error: "Activities must be an array" };
  }

  if (activities.length === 0) {
    return { valid: false, error: "Activities array cannot be empty" };
  }

  const validatedActivities: ActivityRecord[] = [];
  for (let i = 0; i < activities.length; i++) {
    const result = validateActivityRecord(activities[i]);
    if (!result.valid) {
      return { valid: false, error: `Activity at index ${i}: ${result.error}` };
    }
    validatedActivities.push(result.data!);
  }

  return { valid: true, data: validatedActivities };
};

export const validateCategoryName = (name: unknown): ValidationResult => {
  if (typeof name !== "string") {
    return { valid: false, error: "Category name must be a string" };
  }
  if (!name.trim()) {
    return { valid: false, error: "Category name cannot be empty" };
  }
  if (name.length > LIMITS.CATEGORY_NAME_MAX) {
    return {
      valid: false,
      error: `Category name exceeds ${LIMITS.CATEGORY_NAME_MAX} characters`,
    };
  }
  return { valid: true };
};

export const validateDescription = (
  description: unknown,
  fieldName: string = "Description"
): ValidationResult => {
  if (typeof description !== "string") {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (description.length > LIMITS.DESCRIPTION_MAX) {
    return {
      valid: false,
      error: `${fieldName} exceeds ${LIMITS.DESCRIPTION_MAX} characters`,
    };
  }
  return { valid: true };
};

export const validateActivityNameInCategory = (
  name: unknown
): ValidationResult => {
  if (typeof name !== "string") {
    return { valid: false, error: "Activity name must be a string" };
  }
  if (!name.trim()) {
    return { valid: false, error: "Activity name cannot be empty" };
  }
  if (name.length > LIMITS.ACTIVITY_NAME_IN_CATEGORY_MAX) {
    return {
      valid: false,
      error: `Activity name exceeds ${LIMITS.ACTIVITY_NAME_IN_CATEGORY_MAX} characters`,
    };
  }
  return { valid: true };
};

export const validateCategory = (
  category: unknown
): ValidationResult & { data?: Category } => {
  if (category === null || category === undefined) {
    return { valid: false, error: "Category cannot be null or undefined" };
  }

  const casted = category as Category;

  const nameResult = validateCategoryName(casted.name);
  if (!nameResult.valid) {
    return nameResult;
  }

  const descResult = validateDescription(
    casted.description,
    "Category description"
  );
  if (!descResult.valid) {
    return descResult;
  }

  if (typeof casted.active !== "boolean") {
    return { valid: false, error: "Category active must be a boolean" };
  }

  if (!Array.isArray(casted.activityNames)) {
    return { valid: false, error: "Activity names must be an array" };
  }

  if (casted.activityNames.length > LIMITS.MAX_ACTIVITY_NAMES_PER_CATEGORY) {
    return {
      valid: false,
      error: `Activity names exceed limit of ${LIMITS.MAX_ACTIVITY_NAMES_PER_CATEGORY}`,
    };
  }

  const validatedNames: string[] = [];
  const seenNames = new Set<string>();
  for (let i = 0; i < casted.activityNames.length; i++) {
    const result = validateActivityNameInCategory(casted.activityNames[i]);
    if (!result.valid) {
      return {
        valid: false,
        error: `Activity name at index ${i}: ${result.error}`,
      };
    }
    const normalized = casted.activityNames[i].trim().toLowerCase();
    if (seenNames.has(normalized)) {
      return {
        valid: false,
        error: `Duplicate activity name "${casted.activityNames[i]}" at index ${i}`,
      };
    }
    seenNames.add(normalized);
    validatedNames.push(casted.activityNames[i]);
  }

  return {
    valid: true,
    data: {
      name: casted.name,
      description: casted.description,
      active: casted.active,
      activityNames: validatedNames,
    },
  };
};

export const validateRenameBody = (
  body: unknown
): ValidationResultWithData<{ oldName: string; newName: string }> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;

  const oldNameResult = validateActivityName(casted.oldName);
  if (!oldNameResult.valid) {
    return { valid: false, error: `oldName: ${oldNameResult.error}` };
  }
  const newNameResult = validateActivityName(casted.newName);
  if (!newNameResult.valid) {
    return { valid: false, error: `newName: ${newNameResult.error}` };
  }
  if ((casted.oldName as string).trim() === (casted.newName as string).trim()) {
    return { valid: false, error: "oldName and newName must be different" };
  }

  return {
    valid: true,
    data: {
      oldName: (casted.oldName as string).trim(),
      newName: (casted.newName as string).trim(),
    },
  };
};

export const validateAssignCategoryBody = (
  body: unknown
): ValidationResultWithData<{ activityName: string; categoryId: string }> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;

  const nameResult = validateActivityName(casted.activityName);
  if (!nameResult.valid) {
    return { valid: false, error: `activityName: ${nameResult.error}` };
  }
  const categoryIdResult = validateCategoryId(casted.categoryId);
  if (!categoryIdResult.valid) {
    return { valid: false, error: `categoryId: ${categoryIdResult.error}` };
  }

  return {
    valid: true,
    data: {
      activityName: (casted.activityName as string).trim(),
      categoryId: (casted.categoryId as string).trim(),
    },
  };
};

export const validateReassignCategoryBody = (
  body: unknown
): ValidationResultWithData<{
  fromCategoryId: string;
  toCategoryId: string;
}> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;

  const fromResult = validateCategoryId(casted.fromCategoryId);
  if (!fromResult.valid) {
    return { valid: false, error: `fromCategoryId: ${fromResult.error}` };
  }
  const toResult = validateCategoryId(casted.toCategoryId);
  if (!toResult.valid) {
    return { valid: false, error: `toCategoryId: ${toResult.error}` };
  }
  if (
    (casted.fromCategoryId as string).trim() ===
    (casted.toCategoryId as string).trim()
  ) {
    return {
      valid: false,
      error: "fromCategoryId and toCategoryId must be different",
    };
  }

  return {
    valid: true,
    data: {
      fromCategoryId: (casted.fromCategoryId as string).trim(),
      toCategoryId: (casted.toCategoryId as string).trim(),
    },
  };
};

export const validateDeleteByCategoryBody = (
  body: unknown
): ValidationResultWithData<{ categoryId: string }> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;

  const result = validateCategoryId(casted.categoryId);
  if (!result.valid) {
    return { valid: false, error: `categoryId: ${result.error}` };
  }

  return {
    valid: true,
    data: { categoryId: (casted.categoryId as string).trim() },
  };
};

export const validatePreferences = (
  body: unknown
): ValidationResultWithData<UserPreferences> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;

  if (typeof casted.groupByCategory !== "boolean") {
    return { valid: false, error: "groupByCategory must be a boolean" };
  }
  if (typeof casted.funAnimations !== "boolean") {
    return { valid: false, error: "funAnimations must be a boolean" };
  }
  if (typeof casted.isLightTheme !== "boolean") {
    return { valid: false, error: "isLightTheme must be a boolean" };
  }

  return {
    valid: true,
    data: {
      groupByCategory: casted.groupByCategory,
      funAnimations: casted.funAnimations,
      isLightTheme: casted.isLightTheme,
    },
  };
};

export const validateImportData = (
  body: unknown
): ValidationResultWithData<{
  activities: Record<string, ActivityRecord>;
  categories: Record<string, Category>;
  preferences?: UserPreferences;
}> => {
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

  // Validate and sanitize each activity
  const activityEntries = Object.entries(
    casted.activities as Record<string, unknown>
  );
  const sanitizedActivities: Record<string, ActivityRecord> = {};
  for (const [key, activity] of activityEntries) {
    const result = validateActivityRecord(activity);
    if (!result.valid) {
      return { valid: false, error: `Activity "${key}": ${result.error}` };
    }
    sanitizedActivities[key] = result.data!;
  }

  // Validate and sanitize each category
  const categoryEntries = Object.entries(
    casted.categories as Record<string, unknown>
  );
  const sanitizedCategories: Record<string, Category> = {};
  for (const [key, category] of categoryEntries) {
    const result = validateCategory(category);
    if (!result.valid) {
      return { valid: false, error: `Category "${key}": ${result.error}` };
    }
    sanitizedCategories[key] = result.data!;
  }

  // Validate preferences if present
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
