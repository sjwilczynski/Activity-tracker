import { describe, it, expect } from "vitest";
import {
  validateActivityName,
  validateActivityRecord,
  validateActivityBatch,
  validateCategoryName,
  validateDescription,
  validateSubcategory,
  validateCategory,
} from "./validators";
import { LIMITS } from "./constants";

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

describe("validateActivityRecord", () => {
  const validActivity = {
    name: "Running",
    date: "2024-01-15",
    active: true,
  };

  it("accepts valid activity", () => {
    const result = validateActivityRecord(validActivity);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(validActivity);
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

  it("rejects non-boolean active", () => {
    expect(validateActivityRecord({ ...validActivity, active: "yes" })).toEqual(
      {
        valid: false,
        error: "Activity active must be a boolean",
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
});

describe("validateActivityBatch", () => {
  const validActivity = {
    name: "Running",
    date: "2024-01-15",
    active: true,
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
      { name: "", date: "2024-01-15", active: true },
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

describe("validateSubcategory", () => {
  const validSubcategory = {
    name: "Running",
    description: "Outdoor running",
  };

  it("accepts valid subcategory", () => {
    const result = validateSubcategory(validSubcategory);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(validSubcategory);
  });

  it("rejects null", () => {
    expect(validateSubcategory(null)).toEqual({
      valid: false,
      error: "Subcategory cannot be null or undefined",
    });
  });

  it("rejects empty name", () => {
    expect(validateSubcategory({ ...validSubcategory, name: "" })).toEqual({
      valid: false,
      error: "Subcategory name cannot be empty",
    });
  });

  it("rejects name exceeding max length", () => {
    const longName = "a".repeat(LIMITS.SUBCATEGORY_NAME_MAX + 1);
    expect(
      validateSubcategory({ ...validSubcategory, name: longName })
    ).toEqual({
      valid: false,
      error: `Subcategory name exceeds ${LIMITS.SUBCATEGORY_NAME_MAX} characters`,
    });
  });

  it("rejects description exceeding max length", () => {
    const longDesc = "a".repeat(LIMITS.DESCRIPTION_MAX + 1);
    expect(
      validateSubcategory({ ...validSubcategory, description: longDesc })
    ).toEqual({
      valid: false,
      error: `Subcategory description exceeds ${LIMITS.DESCRIPTION_MAX} characters`,
    });
  });
});

describe("validateCategory", () => {
  const validCategory = {
    name: "Sports",
    description: "Physical activities",
    active: true,
    subcategories: [{ name: "Running", description: "Outdoor running" }],
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

  it("rejects non-array subcategories", () => {
    expect(
      validateCategory({ ...validCategory, subcategories: "none" })
    ).toEqual({
      valid: false,
      error: "Subcategories must be an array",
    });
  });

  it("accepts empty subcategories array", () => {
    const result = validateCategory({ ...validCategory, subcategories: [] });
    expect(result.valid).toBe(true);
  });

  it("rejects too many subcategories", () => {
    const tooMany = Array.from(
      { length: LIMITS.MAX_SUBCATEGORIES_PER_CATEGORY + 1 },
      (_, i) => ({
        name: `Sub ${i}`,
        description: "Desc",
      })
    );
    expect(
      validateCategory({ ...validCategory, subcategories: tooMany })
    ).toEqual({
      valid: false,
      error: `Subcategories exceed limit of ${LIMITS.MAX_SUBCATEGORIES_PER_CATEGORY}`,
    });
  });

  it("rejects invalid subcategory in array", () => {
    const result = validateCategory({
      ...validCategory,
      subcategories: [
        { name: "Valid", description: "OK" },
        { name: "", description: "Bad" },
      ],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Subcategory at index 1");
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
