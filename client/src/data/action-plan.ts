import type { QueryKey } from "@tanstack/react-query";
import {
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
  getCategoriesQueryId,
  getPreferencesQueryId,
} from "./react-query-config/query-constants";

const activityQueries = [getActivitiesQueryId, getActivitiesQueryIdWithLimit];
const categoryQueries = [...activityQueries, getCategoriesQueryId];
const allQueries = [...categoryQueries, getPreferencesQueryId];

const routeIntents = {
  welcome: ["add", "import"],
  "activity-list": ["edit", "delete", "delete-all", "import"],
  settings: [
    "add-category",
    "edit-category",
    "delete-category-with-activities",
    "delete-category-reassign",
    "edit-activity",
    "rename-activity",
    "assign-category",
    "add-activity-name",
  ],
} satisfies Record<string, string[]>;

export type ActionRoute = keyof typeof routeIntents;

type Mutation = {
  path: string;
  method: string;
  body?: unknown;
  invalidates: QueryKey[];
  failureContext?: string;
};

function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== "string") throw new Error(`Missing field: ${name}`);
  return value;
}

export function mutationsFor(
  route: ActionRoute,
  form: FormData
): Mutation[] | undefined {
  const intent = form.get("intent");
  if (typeof intent !== "string" || !routeIntents[route].includes(intent)) {
    return undefined;
  }
  const json = (name: string): unknown => JSON.parse(field(form, name));
  const activityPath = () =>
    `/api/activities/${encodeURIComponent(field(form, "id"))}`;
  const categoryPath = () =>
    `/api/categories/${encodeURIComponent(field(form, "id"))}`;
  switch (intent) {
    case "add":
      return [
        {
          path: "/api/activities",
          method: "POST",
          body: json("activities"),
          invalidates: activityQueries,
        },
      ];
    case "edit":
    case "edit-activity":
      return [
        {
          path: activityPath(),
          method: "PUT",
          body: json("record"),
          invalidates: activityQueries,
        },
      ];
    case "delete":
      return [
        {
          path: activityPath(),
          method: "DELETE",
          invalidates: activityQueries,
        },
      ];
    case "delete-all":
      return [
        {
          path: "/api/activities",
          method: "DELETE",
          invalidates: activityQueries,
        },
      ];
    case "import":
      return [
        {
          path: "/api/import",
          method: "POST",
          body: json("importData"),
          invalidates: allQueries,
        },
      ];
    case "add-category":
      return [
        {
          path: "/api/categories",
          method: "POST",
          body: json("category"),
          invalidates: categoryQueries,
        },
      ];
    case "edit-category":
      return [
        {
          path: categoryPath(),
          method: "PUT",
          body: json("category"),
          invalidates: categoryQueries,
        },
      ];
    case "delete-category-with-activities":
      return [
        {
          path: "/api/activities/delete-by-category",
          method: "POST",
          body: { categoryId: field(form, "id") },
          invalidates: activityQueries,
        },
        {
          path: categoryPath(),
          method: "DELETE",
          invalidates: categoryQueries,
          failureContext:
            "Activities deleted, but the category could not be deleted. ",
        },
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
          invalidates: categoryQueries,
        },
        {
          path: categoryPath(),
          method: "DELETE",
          invalidates: categoryQueries,
          failureContext:
            "Activities reassigned, but the category could not be deleted. ",
        },
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
          invalidates: categoryQueries,
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
          invalidates: categoryQueries,
        },
      ];
    case "add-activity-name":
      return [
        {
          path: `/api/categories/${encodeURIComponent(field(form, "categoryId"))}/activity-names`,
          method: "POST",
          body: { activityName: field(form, "activityName") },
          invalidates: categoryQueries,
        },
      ];
  }
}
