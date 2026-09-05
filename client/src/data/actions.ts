import type { QueryClient } from "@tanstack/react-query";
import { apiFetch, type GetAuthToken } from "./apiClient";

export type ActionContext = {
  queryClient: QueryClient;
  getAuthToken: GetAuthToken;
};

export type ActionResult =
  | { ok: true; error?: never; status?: never }
  | { error: string; status?: number; ok?: never };

type Mutation = {
  path: string;
  method: string;
  body?: unknown;
};

function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== "string") throw new Error(`Missing field: ${name}`);
  return value;
}

function mutationsFor(form: FormData): Mutation[] | undefined {
  const json = (name: string): unknown => JSON.parse(field(form, name));
  const activityPath = () =>
    `/api/activities/${encodeURIComponent(field(form, "id"))}`;
  const categoryPath = () =>
    `/api/categories/${encodeURIComponent(field(form, "id"))}`;
  switch (form.get("intent")) {
    case "add":
      return [
        { path: "/api/activities", method: "POST", body: json("activities") },
      ];
    case "edit":
    case "edit-activity":
      return [{ path: activityPath(), method: "PUT", body: json("record") }];
    case "delete":
      return [{ path: activityPath(), method: "DELETE" }];
    case "delete-all":
      return [{ path: "/api/activities", method: "DELETE" }];
    case "import":
      return [
        { path: "/api/import", method: "POST", body: json("importData") },
      ];
    case "add-category":
      return [
        { path: "/api/categories", method: "POST", body: json("category") },
      ];
    case "edit-category":
      return [{ path: categoryPath(), method: "PUT", body: json("category") }];
    case "delete-category-with-activities":
      return [
        {
          path: "/api/activities/delete-by-category",
          method: "POST",
          body: { categoryId: field(form, "id") },
        },
        { path: categoryPath(), method: "DELETE" },
      ];
    case "delete-category-reassign":
      return [
        {
          path: "/api/activities/reassign-category",
          method: "POST",
          body: {
            fromCategoryId: field(form, "id"),
            toCategoryId: field(form, "targetCategoryId"),
          },
        },
        { path: categoryPath(), method: "DELETE" },
      ];
    case "rename-activity":
      return [
        {
          path: "/api/activities/rename",
          method: "POST",
          body: {
            oldName: field(form, "oldName"),
            newName: field(form, "newName"),
            ...(form.get("merge") === "true" && {
              merge: true,
              targetCategoryId: field(form, "targetCategoryId"),
            }),
          },
        },
      ];
    case "assign-category":
      return [
        {
          path: "/api/activities/assign-category",
          method: "POST",
          body: {
            activityName: field(form, "activityName"),
            categoryId: field(form, "categoryId"),
          },
        },
      ];
    case "add-activity-name":
      return [
        {
          path: `/api/categories/${encodeURIComponent(field(form, "categoryId"))}/activity-names`,
          method: "POST",
          body: { activityName: field(form, "activityName") },
        },
      ];
  }
}

/** Production routes and Storybook share mutation semantics and invalidation. */
export async function runAction(
  request: Request,
  { queryClient, getAuthToken }: ActionContext
): Promise<ActionResult> {
  const form = await request.formData();
  const mutations = mutationsFor(form);
  if (!mutations) return { error: "Unknown intent" };

  let changed = false;
  let conflict = false;
  try {
    for (const mutation of mutations) {
      const response = await apiFetch(getAuthToken, mutation.path, {
        method: mutation.method,
        ...(mutation.body !== undefined && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mutation.body),
        }),
        allowNotOk: true,
      });
      if (!response.ok) {
        conflict = response.status === 409;
        const message = response.status < 500 ? await response.text() : "";
        const partial = changed
          ? "Activities changed, but the category could not be deleted. "
          : "";
        return {
          error: `${partial}${message || `Request failed (status: ${response.status})`}`,
          status: response.status,
        };
      }
      changed = true;
    }
    return { ok: true };
  } finally {
    // A later failure must not leave successful earlier writes hidden in cache.
    if (changed || conflict) {
      const keys = ["activities", "activitiesWithLimit", "categories"];
      if (
        form.get("intent") === "import" ||
        form.get("intent") === "delete-all"
      ) {
        keys.push("preferences");
      }
      await Promise.all(
        keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      );
    }
  }
}
