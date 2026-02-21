import { describe, expect, it } from "vitest";
import { LIMITS } from "./constants";
import {
  validateActivityBatch,
  validateActivityName,
  validateActivityNameInCategory,
  validateActivityRecord,
  validateAssignCategoryBody,
  validateCategory,
  validateCategoryId,
  validateCategoryName,
  validateDeleteByCategoryBody,
  validateDescription,
  validateImportData,
  validateIntensity,
  validatePreferences,
  validateReassignCategoryBody,
  validateRenameBody,
  validateTimeSpent,
} from "./validators";

describe("validateActivityName", () => {
  it("accepts valid name", () => {
    expect(validateActivityName("Running")).toEqual({ valid: true });
  });

  it("rejects non-string", () => {
    expect(validateActivityName(123)).toEqual({
      valid: false,
      error: "Activity name must be a string",
    });
  });

  it("rejects empty string", () => {
    expect(validateActivityName("")).toEqual({
      valid: false,
      error: "Activity name cannot be empty",
    });
  });

  it("rejects whitespace-only string", () => {
    expect(validateActivityName("   ")).toEqual({
      valid: false,
      error: "Activity name cannot be empty",
    });
  });

  it("rejects name exceeding max length", () => {
    const longName = "a".repeat(LIMITS.ACTIVITY_NAME_MAX + 1);
    expect(validateActivityName(longName)).toEqual({
      valid: false,
      error: `Activity name exceeds ${LIMITS.ACTIVITY_NAME_MAX} characters`,
    });
  });

  it("accepts name at exact max length", () => {
    const maxName = "a".repeat(LIMITS.ACTIVITY_NAME_MAX);
    expect(validateActivityName(maxName)).toEqual({ valid: true });
  });
});

describe("validateCategoryId", () => {
  it("accepts valid category ID", () => {
    expect(validateCategoryId("-OlhOzarZLqK2dHhKQDd")).toEqual({
      valid: true,
    });
  });

  it("rejects non-string", () => {
    expect(validateCategoryId(123)).toEqual({
      valid: false,
      error: "Category ID must be a string",
    });
  });

  it("rejects empty string", () => {
    expect(validateCategoryId("")).toEqual({
      valid: false,
      error: "Category ID cannot be empty",
    });
  });

  it("rejects whitespace-only string", () => {
    expect(validateCategoryId("   ")).toEqual({
      valid: false,
      error: "Category ID cannot be empty",
    });
  });
});

describe("validateIntensity", () => {
  it("accepts 'low'", () => {
    expect(validateIntensity("low")).toEqual({ valid: true });
  });

  it("accepts 'medium'", () => {
    expect(validateIntensity("medium")).toEqual({ valid: true });
  });

  it("accepts 'high'", () => {
    expect(validateIntensity("high")).toEqual({ valid: true });
  });

  it("rejects invalid string", () => {
    expect(validateIntensity("extreme")).toEqual({
      valid: false,
      error: "Intensity must be one of: low, medium, high",
    });
  });

  it("rejects non-string", () => {
    expect(validateIntensity(5)).toEqual({
      valid: false,
      error: "Intensity must be one of: low, medium, high",
    });
  });
});

describe("validateTimeSpent", () => {
  it("accepts valid time", () => {
    expect(validateTimeSpent(45)).toEqual({ valid: true });
  });

  it("accepts zero", () => {
    expect(validateTimeSpent(0)).toEqual({ valid: true });
  });

  it("rejects non-number", () => {
    expect(validateTimeSpent("45")).toEqual({
      valid: false,
      error: "Time spent must be a number",
    });
  });

  it("rejects negative", () => {
    expect(validateTimeSpent(-10)).toEqual({
      valid: false,
      error: "Time spent must be a non-negative number",
    });
  });

  it("rejects exceeding max", () => {
    expect(validateTimeSpent(LIMITS.MAX_TIME_SPENT + 1)).toEqual({
      valid: false,
      error: `Time spent exceeds ${LIMITS.MAX_TIME_SPENT} minutes`,
    });
  });

  it("accepts at exact max", () => {
    expect(validateTimeSpent(LIMITS.MAX_TIME_SPENT)).toEqual({ valid: true });
  });

  it("rejects NaN", () => {
    expect(validateTimeSpent(NaN)).toEqual({
      valid: false,
      error: "Time spent must be a non-negative number",
    });
  });

  it("rejects Infinity", () => {
    expect(validateTimeSpent(Infinity)).toEqual({
      valid: false,
      error: "Time spent must be a non-negative number",
    });
  });
});

describe("validateActivityRecord", () => {
  const validActivity = {
    name: "Running",
    date: "2024-01-15",
    categoryId: "cat-sports",
  };

  it("accepts valid activity", () => {
    const result = validateActivityRecord(validActivity);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(validActivity);
  });

  it("accepts activity with all optional fields", () => {
    const full = {
      ...validActivity,
      description: "Morning run",
      intensity: "medium" as const,
      timeSpent: 45,
    };
    const result = validateActivityRecord(full);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(full);
  });

  it("rejects null", () => {
    expect(validateActivityRecord(null)).toEqual({
      valid: false,
      error: "Activity cannot be null or undefined",
    });
  });

  it("rejects undefined", () => {
    expect(validateActivityRecord(undefined)).toEqual({
      valid: false,
      error: "Activity cannot be null or undefined",
    });
  });

  it("rejects invalid date format", () => {
    expect(
      validateActivityRecord({ ...validActivity, date: "01-15-2024" })
    ).toEqual({
      valid: false,
      error: "Activity date must be in YYYY-MM-DD format",
    });
  });

  it("rejects non-string date", () => {
    expect(
      validateActivityRecord({ ...validActivity, date: 20240115 })
    ).toEqual({
      valid: false,
      error: "Activity date must be in YYYY-MM-DD format",
    });
  });

  it("rejects missing categoryId", () => {
    expect(
      validateActivityRecord({ name: "Running", date: "2024-01-15" })
    ).toEqual({
      valid: false,
      error: "Category ID must be a string",
    });
  });

  it("rejects invalid intensity", () => {
    expect(
      validateActivityRecord({ ...validActivity, intensity: "extreme" })
    ).toEqual({
      valid: false,
      error: "Intensity must be one of: low, medium, high",
    });
  });

  it("rejects invalid timeSpent", () => {
    expect(validateActivityRecord({ ...validActivity, timeSpent: -5 })).toEqual(
      {
        valid: false,
        error: "Time spent must be a non-negative number",
      }
    );
  });

  it("rejects name exceeding max length", () => {
    const longName = "a".repeat(LIMITS.ACTIVITY_NAME_MAX + 1);
    expect(
      validateActivityRecord({ ...validActivity, name: longName })
    ).toEqual({
      valid: false,
      error: `Activity name exceeds ${LIMITS.ACTIVITY_NAME_MAX} characters`,
    });
  });

  it("strips unknown fields from validated data", () => {
    const result = validateActivityRecord({
      ...validActivity,
      unknownField: "should be stripped",
    });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(validActivity);
    expect(
      (result.data as Record<string, unknown>).unknownField
    ).toBeUndefined();
  });
});

describe("validateActivityBatch", () => {
  const validActivity = {
    name: "Running",
    date: "2024-01-15",
    categoryId: "cat-sports",
  };

  it("accepts valid batch", () => {
    const result = validateActivityBatch([
      validActivity,
      { ...validActivity, name: "Swimming" },
    ]);
    expect(result.valid).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("rejects non-array", () => {
    expect(validateActivityBatch("not an array")).toEqual({
      valid: false,
      error: "Activities must be an array",
    });
  });

  it("rejects empty array", () => {
    expect(validateActivityBatch([])).toEqual({
      valid: false,
      error: "Activities array cannot be empty",
    });
  });

  it("rejects batch with invalid activity", () => {
    const result = validateActivityBatch([
      validActivity,
      { name: "", date: "2024-01-15", categoryId: "cat-sports" },
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Activity at index 1");
    }
  });

  it("accepts large batch (no batch limit)", () => {
    const largeBatch = Array.from({ length: 500 }, (_, i) => ({
      ...validActivity,
      name: `Activity ${i}`,
    }));
    const result = validateActivityBatch(largeBatch);
    expect(result.valid).toBe(true);
    expect(result.data).toHaveLength(500);
  });
});

describe("validateCategoryName", () => {
  it("accepts valid name", () => {
    expect(validateCategoryName("Sports")).toEqual({ valid: true });
  });

  it("rejects non-string", () => {
    expect(validateCategoryName(null)).toEqual({
      valid: false,
      error: "Category name must be a string",
    });
  });

  it("rejects empty string", () => {
    expect(validateCategoryName("")).toEqual({
      valid: false,
      error: "Category name cannot be empty",
    });
  });

  it("rejects name exceeding max length", () => {
    const longName = "a".repeat(LIMITS.CATEGORY_NAME_MAX + 1);
    expect(validateCategoryName(longName)).toEqual({
      valid: false,
      error: `Category name exceeds ${LIMITS.CATEGORY_NAME_MAX} characters`,
    });
  });
});

describe("validateDescription", () => {
  it("accepts valid description", () => {
    expect(validateDescription("A nice description")).toEqual({ valid: true });
  });

  it("accepts empty description", () => {
    expect(validateDescription("")).toEqual({ valid: true });
  });

  it("rejects non-string", () => {
    expect(validateDescription(123)).toEqual({
      valid: false,
      error: "Description must be a string",
    });
  });

  it("rejects description exceeding max length", () => {
    const longDesc = "a".repeat(LIMITS.DESCRIPTION_MAX + 1);
    expect(validateDescription(longDesc)).toEqual({
      valid: false,
      error: `Description exceeds ${LIMITS.DESCRIPTION_MAX} characters`,
    });
  });

  it("uses custom field name in error", () => {
    expect(validateDescription(123, "Notes")).toEqual({
      valid: false,
      error: "Notes must be a string",
    });
  });
});

describe("validateActivityNameInCategory", () => {
  it("accepts valid name", () => {
    expect(validateActivityNameInCategory("Running")).toEqual({ valid: true });
  });

  it("rejects non-string", () => {
    expect(validateActivityNameInCategory(null)).toEqual({
      valid: false,
      error: "Activity name must be a string",
    });
  });

  it("rejects empty name", () => {
    expect(validateActivityNameInCategory("")).toEqual({
      valid: false,
      error: "Activity name cannot be empty",
    });
  });

  it("rejects name exceeding max length", () => {
    const longName = "a".repeat(LIMITS.ACTIVITY_NAME_IN_CATEGORY_MAX + 1);
    expect(validateActivityNameInCategory(longName)).toEqual({
      valid: false,
      error: `Activity name exceeds ${LIMITS.ACTIVITY_NAME_IN_CATEGORY_MAX} characters`,
    });
  });
});

describe("validateCategory", () => {
  const validCategory = {
    name: "Sports",
    description: "Physical activities",
    active: true,
    activityNames: ["Running", "Swimming"],
  };

  it("accepts valid category", () => {
    const result = validateCategory(validCategory);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(validCategory);
  });

  it("rejects null", () => {
    expect(validateCategory(null)).toEqual({
      valid: false,
      error: "Category cannot be null or undefined",
    });
  });

  it("rejects invalid name", () => {
    expect(validateCategory({ ...validCategory, name: "" })).toEqual({
      valid: false,
      error: "Category name cannot be empty",
    });
  });

  it("rejects non-boolean active", () => {
    expect(validateCategory({ ...validCategory, active: "yes" })).toEqual({
      valid: false,
      error: "Category active must be a boolean",
    });
  });

  it("rejects non-array activityNames", () => {
    expect(
      validateCategory({ ...validCategory, activityNames: "none" })
    ).toEqual({
      valid: false,
      error: "Activity names must be an array",
    });
  });

  it("accepts empty activityNames array", () => {
    const result = validateCategory({
      ...validCategory,
      activityNames: [],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects too many activity names", () => {
    const tooMany = Array.from(
      { length: LIMITS.MAX_ACTIVITY_NAMES_PER_CATEGORY + 1 },
      (_, i) => `Activity ${i}`
    );
    expect(
      validateCategory({ ...validCategory, activityNames: tooMany })
    ).toEqual({
      valid: false,
      error: `Activity names exceed limit of ${LIMITS.MAX_ACTIVITY_NAMES_PER_CATEGORY}`,
    });
  });

  it("rejects invalid activity name in array", () => {
    const result = validateCategory({
      ...validCategory,
      activityNames: ["Valid", ""],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Activity name at index 1");
    }
  });

  it("rejects duplicate activity names (case-insensitive)", () => {
    const result = validateCategory({
      ...validCategory,
      activityNames: ["Running", "Swimming", "running"],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('Duplicate activity name "running"');
    }
  });

  it("rejects description exceeding max length", () => {
    const longDesc = "a".repeat(LIMITS.DESCRIPTION_MAX + 1);
    expect(
      validateCategory({ ...validCategory, description: longDesc })
    ).toEqual({
      valid: false,
      error: `Category description exceeds ${LIMITS.DESCRIPTION_MAX} characters`,
    });
  });
});

describe("validateRenameBody", () => {
  it("accepts valid rename", () => {
    const result = validateRenameBody({ oldName: "Running", newName: "Jogging" });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ oldName: "Running", newName: "Jogging" });
  });

  it("rejects non-object", () => {
    expect(validateRenameBody(null)).toEqual({
      valid: false,
      error: "Request body must be an object",
    });
  });

  it("rejects same names", () => {
    expect(validateRenameBody({ oldName: "Running", newName: "Running" })).toEqual({
      valid: false,
      error: "oldName and newName must be different",
    });
  });

  it("rejects empty oldName", () => {
    const result = validateRenameBody({ oldName: "", newName: "Jogging" });
    expect(result.valid).toBe(false);
  });
});

describe("validateAssignCategoryBody", () => {
  it("accepts valid body", () => {
    const result = validateAssignCategoryBody({
      activityName: "Running",
      categoryId: "cat-1",
    });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ activityName: "Running", categoryId: "cat-1" });
  });

  it("rejects missing activityName", () => {
    expect(validateAssignCategoryBody({ categoryId: "cat-1" })).toEqual({
      valid: false,
      error: "activityName: Activity name must be a string",
    });
  });

  it("rejects missing categoryId", () => {
    expect(validateAssignCategoryBody({ activityName: "Running" })).toEqual({
      valid: false,
      error: "categoryId: Category ID must be a string",
    });
  });
});

describe("validateReassignCategoryBody", () => {
  it("accepts valid body", () => {
    const result = validateReassignCategoryBody({
      fromCategoryId: "cat-1",
      toCategoryId: "cat-2",
    });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ fromCategoryId: "cat-1", toCategoryId: "cat-2" });
  });

  it("rejects same IDs", () => {
    expect(
      validateReassignCategoryBody({ fromCategoryId: "cat-1", toCategoryId: "cat-1" })
    ).toEqual({
      valid: false,
      error: "fromCategoryId and toCategoryId must be different",
    });
  });
});

describe("validateDeleteByCategoryBody", () => {
  it("accepts valid body", () => {
    const result = validateDeleteByCategoryBody({ categoryId: "cat-1" });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ categoryId: "cat-1" });
  });

  it("rejects missing categoryId", () => {
    expect(validateDeleteByCategoryBody({})).toEqual({
      valid: false,
      error: "Category ID must be a string",
    });
  });
});

describe("validatePreferences", () => {
  it("accepts valid preferences", () => {
    const result = validatePreferences({
      groupByCategory: true,
      funAnimations: false,
      isLightTheme: true,
    });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      groupByCategory: true,
      funAnimations: false,
      isLightTheme: true,
    });
  });

  it("rejects non-boolean groupByCategory", () => {
    expect(
      validatePreferences({ groupByCategory: "yes", funAnimations: true, isLightTheme: true })
    ).toEqual({ valid: false, error: "groupByCategory must be a boolean" });
  });

  it("rejects missing funAnimations", () => {
    expect(
      validatePreferences({ groupByCategory: true, isLightTheme: true })
    ).toEqual({ valid: false, error: "funAnimations must be a boolean" });
  });

  it("rejects non-object", () => {
    expect(validatePreferences("prefs")).toEqual({
      valid: false,
      error: "Request body must be an object",
    });
  });
});

describe("validateImportData", () => {
  const validActivity = {
    date: "2024-01-15",
    name: "Running",
    categoryId: "cat-1",
  };
  const validCategory = {
    name: "Sports",
    description: "Physical activities",
    active: true,
    activityNames: ["Running"],
  };

  it("accepts valid import data", () => {
    const result = validateImportData({
      activities: { a1: validActivity },
      categories: { c1: validCategory },
    });
    expect(result.valid).toBe(true);
  });

  it("accepts import with preferences", () => {
    const result = validateImportData({
      activities: { a1: validActivity },
      categories: { c1: validCategory },
      preferences: { groupByCategory: true, funAnimations: true, isLightTheme: false },
    });
    expect(result.valid).toBe(true);
  });

  it("rejects missing activities", () => {
    expect(validateImportData({ categories: {} })).toEqual({
      valid: false,
      error: "activities must be an object",
    });
  });

  it("rejects missing categories", () => {
    expect(validateImportData({ activities: {} })).toEqual({
      valid: false,
      error: "categories must be an object",
    });
  });

  it("rejects invalid activity in data", () => {
    const result = validateImportData({
      activities: { a1: { name: "Running", date: "bad-date", categoryId: "c1" } },
      categories: { c1: validCategory },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('Activity "a1"');
    }
  });

  it("rejects invalid category in data", () => {
    const result = validateImportData({
      activities: {},
      categories: { c1: { name: "" } },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('Category "c1"');
    }
  });

  it("rejects invalid preferences", () => {
    const result = validateImportData({
      activities: {},
      categories: {},
      preferences: { groupByCategory: "yes" },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Preferences");
    }
  });
});
