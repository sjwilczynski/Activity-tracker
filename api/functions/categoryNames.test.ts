import { HttpRequest } from "@azure/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { offlineSnapshot } from "../test-support/offlineSnapshot";
import type { Category, CategoryMap } from "../utils/types";

let categories: CategoryMap;
vi.mock("../firebase/firebase", () => ({
  auth: { verifyIdToken: vi.fn(async () => ({ uid: "category-user" })) },
  database: {
    ref: (path: string) => ({
      once: async () =>
        offlineSnapshot(
          path.endsWith("/categories") ? categories : (categories.saved ?? null)
        ),
      push: () => ({
        key: "saved",
        set: async (category: Category) => {
          categories.saved = category;
        },
      }),
      set: async (category: Category) => {
        categories.saved = category;
      },
    }),
  },
}));
vi.mock("../rateLimit/rateLimiter", () => ({
  checkRateLimit: async () => ({ allowed: true }),
  getRateLimitHeaders: () => ({}),
}));

import { firebaseDB } from "../database/firebaseDB";
import { addCategory } from "./addCategory";
import { editCategory } from "./editCategory";

function request(method: string, name: string) {
  return new HttpRequest({
    method,
    url: "http://localhost/api/categories/saved",
    params: { categoryId: "saved" },
    headers: {
      "x-auth-token": "test-token",
      "Content-Type": "application/json",
    },
    body: {
      string: JSON.stringify({
        name,
        description: "",
        active: true,
        activityNames: [" Running "],
      }),
    },
  });
}

describe("category display-name normalization", () => {
  beforeEach(() => {
    categories = {};
  });

  it("trims create and edit requests, keeping internal spacing and membership intact", async () => {
    expect(
      (await addCategory(request("POST", " \tOutdoor  Sports \n"))).status
    ).toBe(200);
    expect((await firebaseDB.getCategories("category-user"))?.saved).toEqual({
      name: "Outdoor  Sports",
      description: "",
      active: true,
      activityNames: [" Running "],
    });
    expect((await editCategory(request("PUT", "  Team Sports  "))).status).toBe(
      204
    );
    expect((await firebaseDB.getCategories("category-user"))?.saved).toEqual({
      name: "Team Sports",
      description: "",
      active: true,
      activityNames: [" Running "],
    });
  });

  it("rejects blank category names without saving or overwriting data", async () => {
    expect((await addCategory(request("POST", " \t\n"))).status).toBe(400);
    expect(categories).toEqual({});
    await addCategory(request("POST", "Sports"));
    expect((await editCategory(request("PUT", " \t\n"))).status).toBe(400);
    expect(categories.saved.name).toBe("Sports");
  });

  it("edits the category title without rejecting distinct existing activity identities", async () => {
    categories.saved = {
      name: "Sports",
      description: "",
      active: true,
      activityNames: ["Running", " Running ", "running"],
    };
    const response = await editCategory(
      new HttpRequest({
        method: "PUT",
        url: "http://localhost/api/categories/saved",
        params: { categoryId: "saved" },
        headers: {
          "x-auth-token": "test-token",
          "Content-Type": "application/json",
        },
        body: {
          string: JSON.stringify({
            ...categories.saved,
            name: "  Team Sports  ",
          }),
        },
      })
    );
    expect(response.status).toBe(204);
    expect((await firebaseDB.getCategories("category-user"))?.saved).toEqual({
      name: "Team Sports",
      description: "",
      active: true,
      activityNames: ["Running", " Running ", "running"],
    });
  });
});
