import type { ActivityRecord, Category, Subcategory } from "../utils/types";
import { LIMITS } from "./constants";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type ValidationResult =
  | { valid: true }
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

  if (typeof castedActivity.active !== "boolean") {
    return { valid: false, error: "Activity active must be a boolean" };
  }

  return { valid: true, data: castedActivity };
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

export const validateSubcategory = (
  subcategory: unknown
): ValidationResult & { data?: Subcategory } => {
  if (subcategory === null || subcategory === undefined) {
    return { valid: false, error: "Subcategory cannot be null or undefined" };
  }

  const casted = subcategory as Subcategory;

  if (typeof casted.name !== "string") {
    return { valid: false, error: "Subcategory name must be a string" };
  }
  if (!casted.name.trim()) {
    return { valid: false, error: "Subcategory name cannot be empty" };
  }
  if (casted.name.length > LIMITS.SUBCATEGORY_NAME_MAX) {
    return {
      valid: false,
      error: `Subcategory name exceeds ${LIMITS.SUBCATEGORY_NAME_MAX} characters`,
    };
  }

  const descResult = validateDescription(
    casted.description,
    "Subcategory description"
  );
  if (!descResult.valid) {
    return descResult;
  }

  return { valid: true, data: casted };
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

  if (!Array.isArray(casted.subcategories)) {
    return { valid: false, error: "Subcategories must be an array" };
  }

  if (casted.subcategories.length > LIMITS.MAX_SUBCATEGORIES_PER_CATEGORY) {
    return {
      valid: false,
      error: `Subcategories exceed limit of ${LIMITS.MAX_SUBCATEGORIES_PER_CATEGORY}`,
    };
  }

  const validatedSubcategories: Subcategory[] = [];
  for (let i = 0; i < casted.subcategories.length; i++) {
    const result = validateSubcategory(casted.subcategories[i]);
    if (!result.valid) {
      return {
        valid: false,
        error: `Subcategory at index ${i}: ${result.error}`,
      };
    }
    validatedSubcategories.push(result.data!);
  }

  return {
    valid: true,
    data: {
      name: casted.name,
      description: casted.description,
      active: casted.active,
      subcategories: validatedSubcategories,
    },
  };
};
