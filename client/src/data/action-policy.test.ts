import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runAction, type ActionRoute } from "./actions";

afterEach(() => vi.unstubAllGlobals());

type Scenario = {
  intent: string;
  fields?: Record<string, string>;
  routes: ActionRoute[];
  calls: [string, string][];
  queries: string[];
};

const scenarios: Scenario[] = [
  {
    intent: "add",
    fields: { activities: "[]" },
    routes: ["welcome"],
    calls: [["POST", "/api/activities"]],
    queries: ["activities", "activitiesWithLimit"],
  },
  {
    intent: "edit",
    fields: { id: "entry", record: "{}" },
    routes: ["activity-list"],
    calls: [["PUT", "/api/activities/entry"]],
    queries: ["activities", "activitiesWithLimit"],
  },
  {
    intent: "edit-activity",
    fields: { id: "entry", record: "{}" },
    routes: ["settings"],
    calls: [["PUT", "/api/activities/entry"]],
    queries: ["activities", "activitiesWithLimit"],
  },
  {
    intent: "delete",
    fields: { id: "entry" },
    routes: ["activity-list"],
    calls: [["DELETE", "/api/activities/entry"]],
    queries: ["activities", "activitiesWithLimit"],
  },
  {
    intent: "delete-all",
    routes: ["activity-list"],
    calls: [["DELETE", "/api/activities"]],
    queries: ["activities", "activitiesWithLimit"],
  },
  {
    intent: "import",
    fields: { importData: "{}" },
    routes: ["welcome", "activity-list"],
    calls: [["POST", "/api/import"]],
    queries: ["activities", "activitiesWithLimit", "categories", "preferences"],
  },
  {
    intent: "add-category",
    fields: { category: "{}" },
    routes: ["settings"],
    calls: [["POST", "/api/categories"]],
    queries: ["activities", "activitiesWithLimit", "categories"],
  },
  {
    intent: "edit-category",
    fields: { id: "sports", category: "{}" },
    routes: ["settings"],
    calls: [["PUT", "/api/categories/sports"]],
    queries: ["activities", "activitiesWithLimit", "categories"],
  },
  {
    intent: "delete-category-with-activities",
    fields: { id: "sports" },
    routes: ["settings"],
    calls: [
      ["POST", "/api/activities/delete-by-category"],
      ["DELETE", "/api/categories/sports"],
    ],
    queries: ["activities", "activitiesWithLimit", "categories"],
  },
  {
    intent: "delete-category-reassign",
    fields: { id: "sports", targetCategoryId: "wellness" },
    routes: ["settings"],
    calls: [
      ["POST", "/api/activities/reassign-category"],
      ["DELETE", "/api/categories/sports"],
    ],
    queries: ["activities", "activitiesWithLimit", "categories"],
  },
  {
    intent: "rename-activity",
    fields: { oldName: "Running", newName: "Jogging" },
    routes: ["settings"],
    calls: [["POST", "/api/activities/rename"]],
    queries: ["activities", "activitiesWithLimit", "categories"],
  },
  {
    intent: "assign-category",
    fields: { activityName: "Running", categoryId: "sports" },
    routes: ["settings"],
    calls: [["POST", "/api/activities/assign-category"]],
    queries: ["activities", "activitiesWithLimit", "categories"],
  },
  {
    intent: "add-activity-name",
    fields: { activityName: "Running", categoryId: "sports" },
    routes: ["settings"],
    calls: [["POST", "/api/categories/sports/activity-names"]],
    queries: ["activities", "activitiesWithLimit", "categories"],
  },
];
const routes: ActionRoute[] = ["welcome", "activity-list", "settings"];

describe.each(routes)("%s action policy", (route) => {
  it.each(scenarios)(
    "handles $intent only on its original routes, with exact effects",
    async (scenario) => {
      const queryClient = new QueryClient();
      const keys = [
        "activities",
        "activitiesWithLimit",
        "categories",
        "preferences",
        "unrelated",
      ];
      for (const key of keys) queryClient.setQueryData([key], []);
      const calls: [string, string][] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string, init: RequestInit) => {
          calls.push([init.method!, url]);
          return new Response(null, { status: 200 });
        })
      );
      const auth = vi.fn(async () => "token");
      const request = new Request(`http://localhost/${route}`, {
        method: "POST",
        body: new URLSearchParams({
          intent: scenario.intent,
          ...scenario.fields,
        }),
      });
      const result = await runAction(
        request,
        { queryClient, getAuthToken: auth },
        route
      );
      const accepted = scenario.routes.includes(route);
      expect(result).toEqual(
        accepted ? { ok: true } : { error: "Unknown intent" }
      );
      expect(calls).toEqual(accepted ? scenario.calls : []);
      if (!accepted) expect(auth).not.toHaveBeenCalled();
      for (const key of keys) {
        expect(queryClient.getQueryState([key])?.isInvalidated, key).toBe(
          accepted && scenario.queries.includes(key)
        );
      }
    }
  );
});
