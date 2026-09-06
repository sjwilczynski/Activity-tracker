import {
  validateActivityName,
  validateCategoryId,
  type ValidationResultWithData,
} from "./record-validation";
import type { RenameOptions, UserPreferences } from "./types";

export const validateRenameBody = (
  body: unknown
): ValidationResultWithData<
  { oldName: string; newName: string } & RenameOptions
> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;
  const oldNameResult = validateActivityName(casted.oldName);
  if (!oldNameResult.valid)
    return { valid: false, error: `oldName: ${oldNameResult.error}` };
  const newNameResult = validateActivityName(casted.newName);
  if (!newNameResult.valid)
    return { valid: false, error: `newName: ${newNameResult.error}` };
  if (casted.merge !== undefined && typeof casted.merge !== "boolean") {
    return { valid: false, error: "merge must be a boolean" };
  }
  if (casted.merge === true && typeof casted.targetCategoryId !== "string") {
    return {
      valid: false,
      error: "A confirmed merge requires the target category ID",
    };
  }
  const oldName = casted.oldName as string;
  // Existing names are identities. Only a newly entered rename is normalized.
  const newName =
    casted.merge === true
      ? (casted.newName as string)
      : (casted.newName as string).trim();
  if (oldName === newName) {
    return { valid: false, error: "oldName and newName must be different" };
  }
  return {
    valid: true,
    data: {
      oldName,
      newName,
      ...(casted.merge === true && {
        merge: true,
        targetCategoryId: casted.targetCategoryId as string,
      }),
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
  if (!nameResult.valid)
    return { valid: false, error: `activityName: ${nameResult.error}` };
  const categoryIdResult = validateCategoryId(casted.categoryId);
  if (!categoryIdResult.valid)
    return { valid: false, error: `categoryId: ${categoryIdResult.error}` };
  return {
    valid: true,
    data: {
      activityName: casted.activityName as string,
      categoryId: casted.categoryId as string,
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
  if (!fromResult.valid)
    return { valid: false, error: `fromCategoryId: ${fromResult.error}` };
  const toResult = validateCategoryId(casted.toCategoryId);
  if (!toResult.valid)
    return { valid: false, error: `toCategoryId: ${toResult.error}` };
  if (casted.fromCategoryId === casted.toCategoryId) {
    return {
      valid: false,
      error: "fromCategoryId and toCategoryId must be different",
    };
  }
  return {
    valid: true,
    data: {
      fromCategoryId: casted.fromCategoryId as string,
      toCategoryId: casted.toCategoryId as string,
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
  if (!result.valid)
    return { valid: false, error: `categoryId: ${result.error}` };
  return {
    valid: true,
    data: { categoryId: casted.categoryId as string },
  };
};

export const validateAddActivityNameBody = (
  body: unknown
): ValidationResultWithData<{ activityName: string }> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;
  const nameResult = validateActivityName(casted.activityName);
  if (!nameResult.valid)
    return { valid: false, error: `activityName: ${nameResult.error}` };
  return {
    valid: true,
    data: { activityName: (casted.activityName as string).trim() },
  };
};

export const validatePreferences = (
  body: unknown
): ValidationResultWithData<UserPreferences> => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const casted = body as Record<string, unknown>;
  if (typeof casted.groupByCategory !== "boolean")
    return { valid: false, error: "groupByCategory must be a boolean" };
  if (typeof casted.funAnimations !== "boolean")
    return { valid: false, error: "funAnimations must be a boolean" };
  if (typeof casted.isLightTheme !== "boolean")
    return { valid: false, error: "isLightTheme must be a boolean" };
  return {
    valid: true,
    data: {
      groupByCategory: casted.groupByCategory,
      funAnimations: casted.funAnimations,
      isLightTheme: casted.isLightTheme,
    },
  };
};
