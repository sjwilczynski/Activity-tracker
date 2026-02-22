import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ActivityMap,
  CategoryMap,
  UserPreferences,
} from "../utils/types";

// In-memory Firebase mock
let store: Record<string, unknown> = {};

function getNestedValue(path: string): unknown {
  const parts = path.replace(/^\//, "").split("/");
  let current: unknown = store;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }
  return current ?? null;
}

function setNestedValue(path: string, value: unknown): void {
  const parts = path.replace(/^\//, "").split("/");
  let current = store as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] == null || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]] as Record<string, unknown>;
  }
  const lastKey = parts[parts.length - 1];
  if (value === null) {
    delete current[lastKey];
  } else {
    current[lastKey] = value;
  }
}

let pushCounter = 0;

function createMockRef(path: string): Record<string, unknown> {
  return {
    once: vi.fn(async () => ({
      val: () => getNestedValue(path),
      exists: () => getNestedValue(path) != null,
      numChildren: () => {
        const val = getNestedValue(path);
        return val && typeof val === "object" ? Object.keys(val).length : 0;
      },
    })),
    orderByChild: vi.fn(() => createMockRef(path)),
    limitToLast: vi.fn((n: number) => {
      const ref = createMockRef(path);
      ref.once = vi.fn(async (): Promise<{ val: () => unknown; exists: () => boolean; numChildren: () => number }> => {
        const val = getNestedValue(path) as Record<string, unknown> | null;
        if (!val) return { val: () => null, exists: () => false, numChildren: () => 0 };
        const entries = Object.entries(val).slice(-n);
        const limited = Object.fromEntries(entries);
        return {
          val: () => limited,
          exists: () => true,
          numChildren: () => entries.length,
        };
      });
      return ref;
    }),
    push: vi.fn(() => {
      const key = `push-${++pushCounter}`;
      return {
        key,
        set: vi.fn(async (value: unknown) => {
          setNestedValue(`${path}/${key}`, value);
        }),
      };
    }),
    set: vi.fn(async (value: unknown) => {
      setNestedValue(path, value);
    }),
    update: vi.fn(async (updates: Record<string, unknown>) => {
      for (const [updatePath, value] of Object.entries(updates)) {
        setNestedValue(`${path}/${updatePath}`, value);
      }
    }),
    remove: vi.fn(async () => {
      setNestedValue(path, null);
    }),
    child: vi.fn((childPath: string) => createMockRef(`${path}/${childPath}`)),
  };
}

vi.mock("../firebase/firebase", () => ({
  database: {
    ref: vi.fn((path: string) => createMockRef(path)),
  },
}));

// Import after mocking
import { firebaseDB } from "./firebaseDB";

const USER_ID = "test-user";

function seedCategories(categories: CategoryMap) {
  setNestedValue(`users/${USER_ID}/categories`, categories);
}

function seedActivities(activities: ActivityMap) {
  setNestedValue(`users/${USER_ID}/activity`, activities);
}

describe("firebaseDB", () => {
  beforeEach(() => {
    store = {};
    pushCounter = 0;
  });

  describe("getActivities — enrichment", () => {
    it("enriches activities with categoryId and active from categories", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running", "Swimming"],
        },
        catB: {
          name: "Learning",
          active: false,
          description: "",
          activityNames: ["Reading"],
        },
      });
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
        act2: { date: "2024-01-02", name: "Reading" },
      });

      const result = await firebaseDB.getActivities(USER_ID);

      expect(result).not.toBeNull();
      expect(result!.act1.categoryId).toBe("catA");
      expect(result!.act1.active).toBe(true);
      expect(result!.act2.categoryId).toBe("catB");
      expect(result!.act2.active).toBe(false);
    });

    it("returns empty categoryId and active=true for orphaned activities", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });
      seedActivities({
        act1: { date: "2024-01-01", name: "Unknown Activity" },
      });

      const result = await firebaseDB.getActivities(USER_ID);

      expect(result!.act1.categoryId).toBe("");
      expect(result!.act1.active).toBe(true);
    });

    it("returns null when no activities exist", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      const result = await firebaseDB.getActivities(USER_ID);
      expect(result).toBeNull();
    });
  });

  describe("bulkReassignCategory", () => {
    it("moves all activity names from source to target category", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running", "Swimming"],
        },
        catB: {
          name: "Other",
          active: true,
          description: "",
          activityNames: ["Yoga"],
        },
      });
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
        act2: { date: "2024-01-02", name: "Swimming" },
      });

      await firebaseDB.bulkReassignCategory(USER_ID, "catA", "catB");

      // Verify category activityNames were moved
      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.activityNames).toEqual([]);
      expect(categories.catB.activityNames).toEqual([
        "Yoga",
        "Running",
        "Swimming",
      ]);

      // Verify enrichment reflects the new mapping
      const activities = await firebaseDB.getActivities(USER_ID);
      expect(activities!.act1.categoryId).toBe("catB");
      expect(activities!.act2.categoryId).toBe("catB");
    });
  });

  describe("bulkAssignCategory", () => {
    it("moves a single activity name to a different category", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running", "Swimming"],
        },
        catB: {
          name: "Other",
          active: false,
          description: "",
          activityNames: [],
        },
      });
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
      });

      await firebaseDB.bulkAssignCategory(USER_ID, "Running", "catB");

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.activityNames).toEqual(["Swimming"]);
      expect(categories.catB.activityNames).toEqual(["Running"]);

      // Verify enrichment
      const activities = await firebaseDB.getActivities(USER_ID);
      expect(activities!.act1.categoryId).toBe("catB");
      expect(activities!.act1.active).toBe(false);
    });
  });

  describe("bulkRenameActivities", () => {
    it("renames activity records and updates category activityNames", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
        act2: { date: "2024-01-02", name: "Running" },
        act3: { date: "2024-01-03", name: "Swimming" },
      });

      const count = await firebaseDB.bulkRenameActivities(
        USER_ID,
        "Running",
        "Jogging"
      );

      expect(count).toBe(2);

      // Verify activity names updated
      const rawActivities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      expect(rawActivities.act1.name).toBe("Jogging");
      expect(rawActivities.act2.name).toBe("Jogging");
      expect(rawActivities.act3.name).toBe("Swimming");

      // Verify category activityNames updated
      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.activityNames).toEqual(["Jogging"]);

      // Verify enrichment
      const activities = await firebaseDB.getActivities(USER_ID);
      expect(activities!.act1.categoryId).toBe("catA");
    });
  });

  describe("addActivityNameToCategory", () => {
    it("adds a new activity name to a category", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });

      await firebaseDB.addActivityNameToCategory(
        USER_ID,
        "catA",
        "Swimming"
      );

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.activityNames).toEqual(["Running", "Swimming"]);
    });

    it("throws if activity name already belongs to another category", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
        catB: {
          name: "Other",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      await expect(
        firebaseDB.addActivityNameToCategory(USER_ID, "catB", "Running")
      ).rejects.toThrow('already belongs to category "Sports"');
    });

    it("is a no-op if the name is already in the target category", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });

      await firebaseDB.addActivityNameToCategory(
        USER_ID,
        "catA",
        "Running"
      );

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.activityNames).toEqual(["Running"]);
    });

    it("throws if category does not exist", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      await expect(
        firebaseDB.addActivityNameToCategory(
          USER_ID,
          "nonexistent",
          "Running"
        )
      ).rejects.toThrow("not found");
    });
  });

  describe("deleteActivitiesByCategory", () => {
    it("deletes activities whose name is in the category's activityNames", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running", "Swimming"],
        },
        catB: {
          name: "Other",
          active: true,
          description: "",
          activityNames: ["Reading"],
        },
      });
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
        act2: { date: "2024-01-02", name: "Swimming" },
        act3: { date: "2024-01-03", name: "Reading" },
      });

      const count = await firebaseDB.deleteActivitiesByCategory(
        USER_ID,
        "catA"
      );

      expect(count).toBe(2);

      const remaining = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      expect(Object.keys(remaining)).toEqual(["act3"]);
    });

    it("returns 0 when category has no activity names", async () => {
      seedCategories({
        catA: {
          name: "Empty",
          active: true,
          description: "",
          activityNames: [],
        },
      });
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
      });

      const count = await firebaseDB.deleteActivitiesByCategory(
        USER_ID,
        "catA"
      );
      expect(count).toBe(0);
    });
  });

  describe("addActivities", () => {
    it("inserts a single activity", async () => {
      await firebaseDB.addActivities(USER_ID, [
        { date: "2024-01-01", name: "Running" },
      ]);

      const activities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      const keys = Object.keys(activities);
      expect(keys).toHaveLength(1);
      expect(activities[keys[0]]).toEqual({
        date: "2024-01-01",
        name: "Running",
      });
    });

    it("inserts multiple activities in bulk", async () => {
      await firebaseDB.addActivities(USER_ID, [
        { date: "2024-01-01", name: "Running" },
        { date: "2024-01-02", name: "Swimming" },
        { date: "2024-01-03", name: "Cycling" },
      ]);

      const activities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      const keys = Object.keys(activities);
      expect(keys).toHaveLength(3);
      const names = keys.map((k) => activities[k].name).sort();
      expect(names).toEqual(["Cycling", "Running", "Swimming"]);
    });

    it("stores all fields correctly", async () => {
      await firebaseDB.addActivities(USER_ID, [
        { date: "2024-06-15", name: "Yoga" },
      ]);

      const activities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      const entry = Object.values(activities)[0];
      expect(entry.date).toBe("2024-06-15");
      expect(entry.name).toBe("Yoga");
    });
  });

  describe("editActivity", () => {
    it("updates fields of an existing activity", async () => {
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
      });

      await firebaseDB.editActivity(USER_ID, "act1", {
        date: "2024-02-01",
        name: "Jogging",
      });

      const activities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      expect(activities.act1.date).toBe("2024-02-01");
      expect(activities.act1.name).toBe("Jogging");
    });

    it("throws when activity does not exist", async () => {
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
      });

      await expect(
        firebaseDB.editActivity(USER_ID, "nonexistent", {
          date: "2024-02-01",
          name: "Jogging",
        })
      ).rejects.toThrow("Unable to find activity with id nonexistent");
    });
  });

  describe("deleteActivity", () => {
    it("removes an existing activity", async () => {
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
        act2: { date: "2024-01-02", name: "Swimming" },
      });

      await firebaseDB.deleteActivity(USER_ID, "act1");

      const activities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      expect(activities.act1).toBeUndefined();
      expect(activities.act2).toBeDefined();
    });

    it("throws when activity does not exist", async () => {
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
      });

      await expect(
        firebaseDB.deleteActivity(USER_ID, "nonexistent")
      ).rejects.toThrow("Unable to find activity with id nonexistent");
    });
  });

  describe("deleteAllActivities", () => {
    it("removes all activities", async () => {
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
        act2: { date: "2024-01-02", name: "Swimming" },
        act3: { date: "2024-01-03", name: "Cycling" },
      });

      await firebaseDB.deleteAllActivities(USER_ID);

      const activities = getNestedValue(`users/${USER_ID}/activity`);
      expect(activities).toBeNull();
    });

    it("is safe to call when no activities exist", async () => {
      await firebaseDB.deleteAllActivities(USER_ID);

      const activities = getNestedValue(`users/${USER_ID}/activity`);
      expect(activities).toBeNull();
    });
  });

  describe("getActivityCount", () => {
    it("returns 0 when no activities exist", async () => {
      const count = await firebaseDB.getActivityCount(USER_ID);
      expect(count).toBe(0);
    });

    it("returns the correct count", async () => {
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
        act2: { date: "2024-01-02", name: "Swimming" },
        act3: { date: "2024-01-03", name: "Cycling" },
      });

      const count = await firebaseDB.getActivityCount(USER_ID);
      expect(count).toBe(3);
    });
  });

  describe("addCategory", () => {
    it("creates a new category with activityNames", async () => {
      await firebaseDB.addCategory(USER_ID, {
        name: "Sports",
        active: true,
        description: "Athletic activities",
        activityNames: ["Running", "Swimming"],
      });

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      const keys = Object.keys(categories);
      expect(keys).toHaveLength(1);
      expect(categories[keys[0]]).toEqual({
        name: "Sports",
        active: true,
        description: "Athletic activities",
        activityNames: ["Running", "Swimming"],
      });
    });

    it("generates a push key for the new category", async () => {
      await firebaseDB.addCategory(USER_ID, {
        name: "Sports",
        active: true,
        description: "",
        activityNames: [],
      });

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      const keys = Object.keys(categories);
      expect(keys).toHaveLength(1);
      expect(keys[0]).toMatch(/^push-/);
    });

    it("can add multiple categories", async () => {
      await firebaseDB.addCategory(USER_ID, {
        name: "Sports",
        active: true,
        description: "",
        activityNames: [],
      });
      await firebaseDB.addCategory(USER_ID, {
        name: "Learning",
        active: false,
        description: "",
        activityNames: ["Reading"],
      });

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      const names = Object.values(categories)
        .map((c) => c.name)
        .sort();
      expect(names).toEqual(["Learning", "Sports"]);
    });
  });

  describe("editCategory", () => {
    it("renames a category", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });

      await firebaseDB.editCategory(USER_ID, "catA", {
        name: "Athletics",
        active: true,
        description: "",
        activityNames: ["Running"],
      });

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.name).toBe("Athletics");
    });

    it("changes active status", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });

      await firebaseDB.editCategory(USER_ID, "catA", {
        name: "Sports",
        active: false,
        description: "",
        activityNames: ["Running"],
      });

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.active).toBe(false);
    });

    it("updates activityNames", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });

      await firebaseDB.editCategory(USER_ID, "catA", {
        name: "Sports",
        active: true,
        description: "Updated",
        activityNames: ["Running", "Swimming", "Cycling"],
      });

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.activityNames).toEqual([
        "Running",
        "Swimming",
        "Cycling",
      ]);
      expect(categories.catA.description).toBe("Updated");
    });

    it("throws when category does not exist", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      await expect(
        firebaseDB.editCategory(USER_ID, "nonexistent", {
          name: "New",
          active: true,
          description: "",
          activityNames: [],
        })
      ).rejects.toThrow("Unable to find category with id nonexistent");
    });
  });

  describe("deleteCategory", () => {
    it("removes an existing category", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
        catB: {
          name: "Other",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      await firebaseDB.deleteCategory(USER_ID, "catA");

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA).toBeUndefined();
      expect(categories.catB).toBeDefined();
    });

    it("throws when category does not exist", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      await expect(
        firebaseDB.deleteCategory(USER_ID, "nonexistent")
      ).rejects.toThrow("Unable to find category with id nonexistent");
    });
  });

  describe("deleteAllCategories", () => {
    it("removes all categories", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
        catB: {
          name: "Other",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      await firebaseDB.deleteAllCategories(USER_ID);

      const categories = getNestedValue(`users/${USER_ID}/categories`);
      expect(categories).toBeNull();
    });

    it("is safe to call when no categories exist", async () => {
      await firebaseDB.deleteAllCategories(USER_ID);

      const categories = getNestedValue(`users/${USER_ID}/categories`);
      expect(categories).toBeNull();
    });
  });

  describe("getCategories", () => {
    it("returns null when no categories exist", async () => {
      const result = await firebaseDB.getCategories(USER_ID);
      expect(result).toBeNull();
    });

    it("returns categories when they exist", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "Athletic",
          activityNames: ["Running", "Swimming"],
        },
        catB: {
          name: "Learning",
          active: false,
          description: "",
          activityNames: ["Reading"],
        },
      });

      const result = await firebaseDB.getCategories(USER_ID);
      expect(result).not.toBeNull();
      expect(Object.keys(result!)).toHaveLength(2);
      expect(result!.catA.name).toBe("Sports");
      expect(result!.catA.activityNames).toEqual(["Running", "Swimming"]);
      expect(result!.catB.name).toBe("Learning");
      expect(result!.catB.active).toBe(false);
    });
  });

  describe("getCategoryCount", () => {
    it("returns 0 when no categories exist", async () => {
      const count = await firebaseDB.getCategoryCount(USER_ID);
      expect(count).toBe(0);
    });

    it("returns the correct count", async () => {
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: [],
        },
        catB: {
          name: "Learning",
          active: true,
          description: "",
          activityNames: [],
        },
      });

      const count = await firebaseDB.getCategoryCount(USER_ID);
      expect(count).toBe(2);
    });
  });

  describe("getPreferences", () => {
    it("returns defaults when no preferences are stored", async () => {
      const prefs = await firebaseDB.getPreferences(USER_ID);
      expect(prefs).toEqual({
        groupByCategory: true,
        funAnimations: true,
        isLightTheme: true,
      });
    });

    it("merges stored preferences with defaults", async () => {
      setNestedValue(`users/${USER_ID}/preferences`, {
        funAnimations: false,
      });

      const prefs = await firebaseDB.getPreferences(USER_ID);
      expect(prefs.groupByCategory).toBe(true);
      expect(prefs.funAnimations).toBe(false);
      expect(prefs.isLightTheme).toBe(true);
    });

    it("returns fully overridden preferences", async () => {
      setNestedValue(`users/${USER_ID}/preferences`, {
        groupByCategory: false,
        funAnimations: false,
        isLightTheme: false,
      });

      const prefs = await firebaseDB.getPreferences(USER_ID);
      expect(prefs).toEqual({
        groupByCategory: false,
        funAnimations: false,
        isLightTheme: false,
      });
    });
  });

  describe("setPreferences", () => {
    it("stores preferences", async () => {
      const prefs: UserPreferences = {
        groupByCategory: false,
        funAnimations: true,
        isLightTheme: false,
      };

      await firebaseDB.setPreferences(USER_ID, prefs);

      const stored = getNestedValue(
        `users/${USER_ID}/preferences`
      ) as UserPreferences;
      expect(stored).toEqual(prefs);
    });

    it("overwrites existing preferences", async () => {
      setNestedValue(`users/${USER_ID}/preferences`, {
        groupByCategory: true,
        funAnimations: true,
        isLightTheme: true,
      });

      const newPrefs: UserPreferences = {
        groupByCategory: false,
        funAnimations: false,
        isLightTheme: false,
      };

      await firebaseDB.setPreferences(USER_ID, newPrefs);

      const stored = getNestedValue(
        `users/${USER_ID}/preferences`
      ) as UserPreferences;
      expect(stored).toEqual(newPrefs);
    });

    it("round-trips with getPreferences", async () => {
      const prefs: UserPreferences = {
        groupByCategory: false,
        funAnimations: true,
        isLightTheme: false,
      };

      await firebaseDB.setPreferences(USER_ID, prefs);
      const retrieved = await firebaseDB.getPreferences(USER_ID);
      expect(retrieved).toEqual(prefs);
    });
  });

  describe("getUserData", () => {
    it("returns defaults when user has no data", async () => {
      const data = await firebaseDB.getUserData(USER_ID);
      expect(data.activities).toEqual({});
      expect(data.categories).toEqual({});
      expect(data.preferences).toEqual({
        groupByCategory: true,
        funAnimations: true,
        isLightTheme: true,
      });
    });

    it("returns full user data", async () => {
      seedActivities({
        act1: { date: "2024-01-01", name: "Running" },
      });
      seedCategories({
        catA: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
      });
      setNestedValue(`users/${USER_ID}/preferences`, {
        groupByCategory: false,
        funAnimations: false,
        isLightTheme: true,
      });

      const data = await firebaseDB.getUserData(USER_ID);
      expect(Object.keys(data.activities)).toHaveLength(1);
      expect(data.activities.act1.name).toBe("Running");
      expect(Object.keys(data.categories)).toHaveLength(1);
      expect(data.categories.catA.name).toBe("Sports");
      expect(data.preferences.groupByCategory).toBe(false);
      expect(data.preferences.funAnimations).toBe(false);
      expect(data.preferences.isLightTheme).toBe(true);
    });

    it("merges partial preferences with defaults", async () => {
      setNestedValue(`users/${USER_ID}/preferences`, {
        isLightTheme: false,
      });

      const data = await firebaseDB.getUserData(USER_ID);
      expect(data.preferences).toEqual({
        groupByCategory: true,
        funAnimations: true,
        isLightTheme: false,
      });
    });
  });

  describe("setUserData", () => {
    it("stores full user data", async () => {
      await firebaseDB.setUserData(USER_ID, {
        activities: {
          act1: { date: "2024-01-01", name: "Running" },
        },
        categories: {
          catA: {
            name: "Sports",
            active: true,
            description: "",
            activityNames: ["Running"],
          },
        },
        preferences: {
          groupByCategory: false,
          funAnimations: true,
          isLightTheme: false,
        },
      });

      const activities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      expect(activities.act1.name).toBe("Running");

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.catA.name).toBe("Sports");

      const preferences = getNestedValue(
        `users/${USER_ID}/preferences`
      ) as UserPreferences;
      expect(preferences.groupByCategory).toBe(false);
    });

    it("round-trips with getUserData", async () => {
      const original = {
        activities: {
          act1: { date: "2024-01-01", name: "Running" },
          act2: { date: "2024-01-02", name: "Swimming" },
        },
        categories: {
          catA: {
            name: "Sports",
            active: true,
            description: "Athletic activities",
            activityNames: ["Running", "Swimming"],
          },
        },
        preferences: {
          groupByCategory: false,
          funAnimations: false,
          isLightTheme: true,
        } as UserPreferences,
      };

      await firebaseDB.setUserData(USER_ID, original);
      const retrieved = await firebaseDB.getUserData(USER_ID);

      expect(retrieved.activities).toEqual(original.activities);
      expect(retrieved.categories).toEqual(original.categories);
      expect(retrieved.preferences).toEqual(original.preferences);
    });

    it("overwrites existing data", async () => {
      seedActivities({
        old1: { date: "2023-01-01", name: "OldActivity" },
      });
      seedCategories({
        oldCat: {
          name: "OldCategory",
          active: false,
          description: "",
          activityNames: ["OldActivity"],
        },
      });

      await firebaseDB.setUserData(USER_ID, {
        activities: {
          new1: { date: "2024-06-01", name: "NewActivity" },
        },
        categories: {
          newCat: {
            name: "NewCategory",
            active: true,
            description: "",
            activityNames: ["NewActivity"],
          },
        },
        preferences: {
          groupByCategory: true,
          funAnimations: true,
          isLightTheme: true,
        },
      });

      const activities = getNestedValue(
        `users/${USER_ID}/activity`
      ) as ActivityMap;
      expect(activities.old1).toBeUndefined();
      expect(activities.new1.name).toBe("NewActivity");

      const categories = getNestedValue(
        `users/${USER_ID}/categories`
      ) as CategoryMap;
      expect(categories.oldCat).toBeUndefined();
      expect(categories.newCat.name).toBe("NewCategory");
    });
  });
});
