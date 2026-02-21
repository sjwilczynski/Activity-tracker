import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActivityMap, CategoryMap } from "../utils/types";

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
});
