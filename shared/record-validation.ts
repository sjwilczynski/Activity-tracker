import { LIMITS } from "./constants";
import type { ActivityRecord, Category, Intensity } from "./types";

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

  const castedActivity = activity as Record<string, unknown>;

  if (
    typeof castedActivity.date !== "string" ||
    !DATE_REGEX.test(castedActivity.date)
  ) {
    return {
      valid: false,
      error: "Activity date must be in YYYY-MM-DD format",
    };
  }
  const calendarDate = new Date(`${castedActivity.date}T00:00:00.000Z`);
  if (
    !Number.isFinite(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== castedActivity.date
  ) {
    return {
      valid: false,
      error: "Activity date must be a valid calendar date",
    };
  }

  const nameValidation = validateActivityName(castedActivity.name);
  if (!nameValidation.valid) {
    return nameValidation;
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

  // Build storage record — categoryId is NOT stored (derived from categories)
  const data: ActivityRecord = {
    date: castedActivity.date as string,
    name: castedActivity.name as string,
  };
  if (castedActivity.description !== undefined) {
    data.description = castedActivity.description as string;
  }
  if (castedActivity.intensity !== undefined) {
    data.intensity = castedActivity.intensity as ActivityRecord["intensity"];
  }
  if (castedActivity.timeSpent !== undefined) {
    data.timeSpent = castedActivity.timeSpent as number;
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
  if (name.trim().length > LIMITS.CATEGORY_NAME_MAX) {
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
      name: casted.name.trim(),
      description: casted.description,
      active: casted.active,
      activityNames: validatedNames,
    },
  };
};
