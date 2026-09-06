import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as actions from "./actions";

afterEach(() => vi.unstubAllGlobals());

const activity = { date: "2026-09-06", name: "Running", categoryId: "sports" };
const category = {
  name: "Sports",
  description: "",
  active: true,
  activityNames: [],
};
const activities = ["activities", "activitiesWithLimit"];
const categories = [...activities, "categories"];
type Context = {
  queryClient: QueryClient;
  getAuthToken: () => Promise<string>;
};

const scenarios = [
  {
    name: "add",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.addActivitiesMutationOptions(ctx)
      ).mutate([activity]),
    calls: [["POST", "/api/activities"]],
    queries: activities,
  },
  {
    name: "edit",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.editActivityMutationOptions(ctx)
      ).mutate({ id: "entry", record: activity }),
    calls: [["PUT", "/api/activities/entry"]],
    queries: activities,
  },
  {
    name: "delete",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.deleteActivityMutationOptions(ctx)
      ).mutate("entry"),
    calls: [["DELETE", "/api/activities/entry"]],
    queries: activities,
  },
  {
    name: "delete-all",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.deleteAllActivitiesMutationOptions(ctx)
      ).mutate(),
    calls: [["DELETE", "/api/activities"]],
    queries: activities,
  },
  {
    name: "restore",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.restoreBackupMutationOptions(ctx)
      ).mutate({ activities: {}, categories: {} }),
    calls: [["POST", "/api/import"]],
    queries: [...categories, "preferences"],
  },
  {
    name: "add category",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.addCategoryMutationOptions(ctx)
      ).mutate(category),
    calls: [["POST", "/api/categories"]],
    queries: categories,
  },
  {
    name: "edit category",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.editCategoryMutationOptions(ctx)
      ).mutate({ id: "sports", category }),
    calls: [["PUT", "/api/categories/sports"]],
    queries: categories,
  },
  {
    name: "delete category with activities",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.deleteCategoryMutationOptions(ctx)
      ).mutate({ id: "sports", mode: "delete" }),
    calls: [
      ["POST", "/api/activities/delete-by-category"],
      ["DELETE", "/api/categories/sports"],
    ],
    queries: categories,
  },
  {
    name: "reassign then delete category",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.deleteCategoryMutationOptions(ctx)
      ).mutate({
        id: "sports",
        mode: "reassign",
        targetCategoryId: "wellness",
      }),
    calls: [
      ["POST", "/api/activities/reassign-category"],
      ["DELETE", "/api/categories/sports"],
    ],
    queries: categories,
  },
  {
    name: "rename",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.renameActivityMutationOptions(ctx)
      ).mutate({ oldName: "Running", newName: "Jogging" }),
    calls: [["POST", "/api/activities/rename"]],
    queries: categories,
  },
  {
    name: "assign",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.assignActivityCategoryMutationOptions(ctx)
      ).mutate({ activityName: "Running", categoryId: "sports" }),
    calls: [["POST", "/api/activities/assign-category"]],
    queries: categories,
  },
  {
    name: "add activity name",
    run: (ctx: Context) =>
      new MutationObserver(
        ctx.queryClient,
        actions.addActivityNameMutationOptions(ctx)
      ).mutate({ activityName: "Running", categoryId: "sports" }),
    calls: [["POST", "/api/categories/sports/activity-names"]],
    queries: categories,
  },
];

describe("typed mutation operation contracts", () => {
  it.each(scenarios)(
    "$name preserves ordered HTTP operations and exact effects",
    async (scenario) => {
      const queryClient = new QueryClient();
      const keys = [...categories, "preferences", "unrelated"];
      for (const key of keys) queryClient.setQueryData([key], []);
      const calls: [string, string][] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string, init: RequestInit) => {
          calls.push([init.method!, url]);
          expect(new Headers(init.headers).get("x-auth-token")).toBe("token");
          return new Response(null, { status: 200 });
        })
      );
      try {
        await expect(
          scenario.run({ queryClient, getAuthToken: async () => "token" })
        ).resolves.toBeUndefined();
        expect(calls).toEqual(scenario.calls);
        for (const key of keys) {
          expect(queryClient.getQueryState([key])?.isInvalidated, key).toBe(
            scenario.queries.includes(key)
          );
        }
      } finally {
        queryClient.clear();
      }
    }
  );
});
