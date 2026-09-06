import { HttpRequest } from "@azure/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findRenameTarget } from "../../shared/activity-names";
import { offlineSnapshot } from "../test-support/offlineSnapshot";
import type { ActivityMap, CategoryMap } from "../utils/types";

type StoredUser = { activity: ActivityMap; categories: CategoryMap };
let user: StoredUser;
vi.mock("../firebase/firebase", () => ({
  auth: { verifyIdToken: vi.fn(async () => ({ uid: "identity-user" })) },
  database: {
    ref: () => ({
      once: async () => offlineSnapshot(user),
      transaction: async (
        update: (value: unknown) => StoredUser | undefined
      ) => {
        const next = update((await offlineSnapshot(user)).val());
        if (next !== undefined) user = next;
        return {
          committed: next !== undefined,
          snapshot: await offlineSnapshot(user),
        };
      },
    }),
  },
}));
vi.mock("../rateLimit/rateLimiter", () => ({
  checkRateLimit: async () => ({ allowed: true }),
  getRateLimitHeaders: () => ({}),
}));

import { firebaseDB } from "../database/firebaseDB";
import { renameActivities } from "./renameActivities";

function rename(body: unknown) {
  return renameActivities(
    new HttpRequest({
      method: "POST",
      url: "http://localhost/api/activities/rename",
      headers: {
        "x-auth-token": "test-token",
        "Content-Type": "application/json",
      },
      body: { string: JSON.stringify(body) },
    })
  );
}

describe("selected activity-name identities through the rename endpoint", () => {
  beforeEach(() => {
    user = {
      activity: {
        source: {
          name: "Running",
          date: "2024-01-01",
          description: "Keep",
          timeSpent: 0,
        },
        target: { name: "Yoga", date: "2024-01-02", intensity: "high" },
        unrelated: { name: "Swimming", date: "2024-01-03" },
      },
      categories: {
        sports: {
          name: "Sports",
          description: "",
          active: true,
          activityNames: ["Running", "Swimming"],
        },
        wellness: {
          name: "Wellness",
          description: "",
          active: true,
          activityNames: ["Yoga"],
        },
      },
    };
  });

  it.each([
    [" Running ", "Yoga"],
    ["Running", " Yoga "],
    [" Running ", "Running"],
  ])("merges exactly %j into canonical %j", async (sourceName, targetName) => {
    user.activity.source.name = sourceName;
    user.activity.target.name = targetName;
    user.categories.sports.activityNames = [sourceName, "Swimming"];
    user.categories.wellness.activityNames = [targetName];
    if (sourceName.trim() !== sourceName && targetName !== sourceName.trim()) {
      user.activity.similar = { name: sourceName.trim(), date: "2024-01-04" };
    }
    const before = structuredClone(user.activity);
    const target = findRenameTarget(
      user.activity,
      user.categories,
      sourceName,
      targetName.trim()
    );
    expect(target).toBeDefined();
    const response = await rename({
      oldName: sourceName,
      newName: target?.name,
      merge: true,
      targetCategoryId: target?.categoryId,
    });
    expect(response).toMatchObject({ status: 200, jsonBody: { updated: 1 } });
    const saved = await firebaseDB.getUserData("identity-user");
    expect(saved.activities).toEqual({
      ...before,
      source: { ...before.source, name: targetName },
    });
    expect(saved.categories.sports.activityNames).toEqual(["Swimming"]);
    expect(saved.categories.wellness.activityNames).toEqual([targetName]);
  });

  it("can explicitly trim a legacy name without merging it", async () => {
    user.activity.source.name = " Running ";
    user.categories.sports.activityNames = [" Running ", "Swimming"];
    expect(
      await rename({ oldName: " Running ", newName: "Running" })
    ).toMatchObject({ status: 200, jsonBody: { updated: 1 } });
    expect(user.categories.sports.activityNames).toEqual([
      "Running",
      "Swimming",
    ]);
    expect(user.activity.source.name).toBe("Running");
  });

  it("rejects a collision without confirmation and leaves both histories untouched", async () => {
    const before = structuredClone(user);
    expect(await rename({ oldName: "Running", newName: "Yoga" })).toMatchObject(
      { status: 409, body: expect.stringMatching(/confirm a merge/i) }
    );
    expect(user).toEqual(before);
  });
});
