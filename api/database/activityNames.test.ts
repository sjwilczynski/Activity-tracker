import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActivityMap, CategoryMap } from "../utils/types";

type StoredUser = {
  activity: ActivityMap;
  categories: CategoryMap;
  preferences?: unknown;
};
let user: StoredUser;
let failCommit = false;
let beforeRetry: (() => void) | undefined;
let coldCache = false;
let retryThrew = false;

vi.mock("../firebase/firebase", () => ({
  database: {
    ref: (path: string) => {
      const isCategories = path.endsWith("/categories");
      const current = () => (isCategories ? user.categories : user);
      return {
        once: async () => ({ val: () => structuredClone(current()) }),
        transaction: async (
          update: (
            value: unknown
          ) => StoredUser | CategoryMap | null | undefined
        ) => {
          if (coldCache) update(null);
          let next = update(structuredClone(current()));
          if (beforeRetry) {
            await Promise.resolve();
            beforeRetry();
            try {
              next = update(structuredClone(current()));
            } catch (error) {
              retryThrew = true;
              throw error;
            }
          }
          if (failCommit) throw new Error("Storage unavailable");
          if (next === undefined) {
            return {
              committed: false,
              snapshot: { val: () => structuredClone(current()) },
            };
          }
          if (isCategories) user.categories = next as CategoryMap;
          else user = next as StoredUser;
          return {
            committed: true,
            snapshot: { val: () => structuredClone(next) },
          };
        },
      };
    },
  },
}));

import { firebaseDB } from "./firebaseDB";

describe("activity-name transaction guarantees", () => {
  beforeEach(() => {
    failCommit = false;
    beforeRetry = undefined;
    coldCache = false;
    retryThrew = false;
    user = {
      activity: {
        source: {
          name: "Running",
          date: "2024-01-01",
          description: "Keep",
          timeSpent: 0,
        },
        target: { name: "Yoga", date: "2024-01-01", intensity: "low" },
      },
      categories: {
        sports: {
          name: "Sports",
          active: true,
          description: "",
          activityNames: ["Running"],
        },
        wellness: {
          name: "Wellness",
          active: false,
          description: "",
          activityNames: ["Yoga"],
        },
      },
      preferences: {
        groupByCategory: false,
        funAnimations: false,
        isLightTheme: false,
      },
    };
  });

  it("leaves all data unchanged if the rename commit fails", async () => {
    const before = await firebaseDB.getUserData("u");
    failCommit = true;
    await expect(
      firebaseDB.bulkRenameActivities("u", "Running", "Jogging")
    ).rejects.toThrow("Storage unavailable");
    expect(await firebaseDB.getUserData("u")).toEqual(before);
  });

  it("handles Firebase's initial null cache before receiving existing data", async () => {
    coldCache = true;
    await firebaseDB.bulkAssignCategory("u", "Running", "wellness");
    expect(
      (await firebaseDB.getCategories("u"))?.wellness.activityNames
    ).toEqual(["Yoga", "Running"]);
  });

  it("retries rename against current entries without losing concurrent additions", async () => {
    beforeRetry = () => {
      user.activity.concurrent = { name: "Running", date: "2024-01-02" };
      user.categories.sports.activityNames.push("Swimming");
    };
    expect(
      await firebaseDB.bulkRenameActivities("u", "Running", "Jogging")
    ).toBe(2);
    const saved = await firebaseDB.getUserData("u");
    expect(saved.activities.concurrent.name).toBe("Jogging");
    expect(saved.categories.sports.activityNames).toEqual([
      "Jogging",
      "Swimming",
    ]);
    expect(saved.preferences.groupByCategory).toBe(false);
  });

  it("rejects a merge if the confirmed target moved categories during a retry", async () => {
    beforeRetry = () => {
      user.categories.wellness.activityNames = [];
      user.categories.sports.activityNames.push("Yoga");
    };
    await expect(
      firebaseDB.bulkRenameActivities("u", "Running", "Yoga", {
        merge: true,
        targetCategoryId: "wellness",
      })
    ).rejects.toThrow(/target changed/i);
    expect(retryThrew).toBe(false);
    expect((await firebaseDB.getUserData("u")).activities.source.name).toBe(
      "Running"
    );
  });

  it("rejects assignment to a missing category without orphaning a name", async () => {
    const before = await firebaseDB.getUserData("u");
    await expect(
      firebaseDB.bulkAssignCategory("u", "Running", "missing")
    ).rejects.toThrow(/no longer exists/i);
    expect(await firebaseDB.getUserData("u")).toEqual(before);
  });

  it("preserves concurrent category changes when retrying an assignment", async () => {
    beforeRetry = () =>
      user.categories.wellness.activityNames.push("Meditation");
    await firebaseDB.bulkAssignCategory("u", "Running", "wellness");
    expect(
      (await firebaseDB.getCategories("u"))?.wellness.activityNames
    ).toEqual(["Yoga", "Meditation", "Running"]);
  });

  it("allows a confirmed merge into an uncategorized name", async () => {
    user.categories.wellness.activityNames = [];
    await firebaseDB.bulkRenameActivities("u", "Running", "Yoga", {
      merge: true,
      targetCategoryId: "",
    });
    const saved = await firebaseDB.getUserData("u");
    expect(saved.categories.sports.activityNames).toEqual([]);
    expect(saved.activities.source).toEqual({
      name: "Yoga",
      date: "2024-01-01",
      description: "Keep",
      timeSpent: 0,
    });
  });

  it("rejects ambiguous target ownership and preserves both histories", async () => {
    user.categories.sports.activityNames.push("Yoga");
    const before = await firebaseDB.getUserData("u");
    await expect(
      firebaseDB.bulkRenameActivities("u", "Running", "Yoga", {
        merge: true,
        targetCategoryId: "wellness",
      })
    ).rejects.toThrow(/multiple categories/i);
    expect(await firebaseDB.getUserData("u")).toEqual(before);
  });
});
