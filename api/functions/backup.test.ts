import { HttpRequest } from "@azure/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isImportDataValid } from "../../shared/backup";
import type { UserData } from "../utils/types";

let userData: Record<string, unknown> = {};

vi.mock("../firebase/firebase", () => ({
  auth: { verifyIdToken: vi.fn(async () => ({ uid: "backup-user" })) },
  database: {
    ref: (path: string) => ({
      once: async () => ({
        val: () =>
          structuredClone(path === "/users/backup-user" ? userData : null),
      }),
      update: async (updates: Record<string, unknown>) => {
        userData = { ...userData, ...structuredClone(updates) };
      },
      transaction: async (update: (value: null) => unknown) => ({
        committed: true,
        snapshot: { val: () => update(null) },
      }),
    }),
  },
}));

import { exportData } from "./exportData";
import { importData } from "./importData";

const backup: UserData = {
  activities: {
    first: {
      name: "Running",
      date: "2026-09-05",
      description: "Morning run",
      intensity: "high",
      timeSpent: 30,
    },
  },
  categories: {
    sports: {
      name: "Sports",
      description: "",
      active: true,
      activityNames: ["Running"],
    },
  },
  preferences: {
    groupByCategory: false,
    funAnimations: false,
    isLightTheme: false,
  },
};

function request(method: string, body?: unknown) {
  return new HttpRequest({
    method,
    url: "http://localhost/api/backup",
    headers: {
      "x-auth-token": "test-token",
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: { string: JSON.stringify(body) } }),
  });
}

describe("backup round trip", () => {
  beforeEach(() => {
    userData = {
      activity: structuredClone(backup.activities),
      categories: structuredClone(backup.categories),
      preferences: structuredClone(backup.preferences),
    };
  });

  it("restores a real export accepted by the upload form without derived fields", async () => {
    const exported = await exportData(request("GET"));
    expect(exported.status).toBe(200);
    expect(exported.jsonBody).toEqual(backup);
    expect(isImportDataValid(exported.jsonBody)).toBe(true);

    userData = { activity: { obsolete: { date: "2020-01-01", name: "Old" } } };
    const restored = await importData(request("POST", exported.jsonBody));
    expect(restored.status).toBe(200);
    expect((await exportData(request("GET"))).jsonBody).toEqual(backup);
  });

  it("restores an empty export, including preferences, over existing data", async () => {
    userData = { preferences: backup.preferences };
    const exported = await exportData(request("GET"));
    expect(isImportDataValid(exported.jsonBody)).toBe(true);
    userData = { activity: backup.activities, categories: backup.categories };
    expect((await importData(request("POST", exported.jsonBody))).status).toBe(
      200
    );
    expect((await exportData(request("GET"))).jsonBody).toEqual({
      activities: {},
      categories: {},
      preferences: backup.preferences,
    });
  });

  it("rejects impossible calendar dates before a restore changes data", async () => {
    const malformed = {
      ...backup,
      activities: { first: { name: "Running", date: "2026-02-30" } },
    };
    expect(isImportDataValid(malformed)).toBe(false);
    expect((await importData(request("POST", malformed))).status).toBe(400);
    expect((await exportData(request("GET"))).jsonBody).toEqual(backup);
  });

  it("accepts old backups with derived display fields and strips those fields on restore", async () => {
    const legacy = {
      ...backup,
      activities: {
        first: {
          ...backup.activities.first,
          categoryId: "sports",
          active: true,
        },
      },
    };
    expect(isImportDataValid(legacy)).toBe(true);
    expect((await importData(request("POST", legacy))).status).toBe(200);
    expect((await exportData(request("GET"))).jsonBody).toEqual(backup);
  });

  it("round-trips Firebase categories whose empty membership arrays were omitted", async () => {
    userData.categories = {
      empty: { name: "Empty category", description: "", active: true },
    };
    const exported = await exportData(request("GET"));
    expect(isImportDataValid(exported.jsonBody)).toBe(true);
    expect((await importData(request("POST", exported.jsonBody))).status).toBe(
      200
    );
    expect((await exportData(request("GET"))).jsonBody.categories).toEqual({
      empty: {
        name: "Empty category",
        description: "",
        active: true,
        activityNames: [],
      },
    });
  });

  it("restores older exports that omitted empty category membership", async () => {
    const legacy = {
      ...backup,
      categories: { empty: { name: "Empty", description: "", active: true } },
    };
    expect(isImportDataValid(legacy)).toBe(true);
    expect((await importData(request("POST", legacy))).status).toBe(200);
    expect(
      (await exportData(request("GET"))).jsonBody.categories.empty.activityNames
    ).toEqual([]);
  });

  it.each([null, "Running", {}, [1]])(
    "rejects invalid membership %j rather than normalizing it away",
    async (activityNames) => {
      const malformed = {
        ...backup,
        categories: { sports: { ...backup.categories.sports, activityNames } },
      };
      expect(isImportDataValid(malformed)).toBe(false);
      expect((await importData(request("POST", malformed))).status).toBe(400);
      expect((await exportData(request("GET"))).jsonBody).toEqual(backup);
    }
  );
});
