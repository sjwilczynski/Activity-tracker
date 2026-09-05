import { http, HttpResponse } from "msw";
import {
  ActivityNameConflict,
  assignActivityName,
  reassignCategory,
  renameActivityName,
} from "../../../../shared/activity-names";
import type { CategoryMap } from "../../../../shared/types";
import {
  validateAssignCategoryBody,
  validateReassignCategoryBody,
  validateRenameBody,
} from "../../../../shared/validators";
import { getActivities, setActivities } from "./activities";
import { getCategories, setCategories } from "./categories";

const categoryMap = () =>
  Object.fromEntries(
    getCategories().map(({ id, ...category }) => [id, category])
  );
const saveCategories = (categories: CategoryMap) =>
  setCategories(
    Object.entries(categories).map(([id, category]) => ({ ...category, id }))
  );

function conflictResponse(error: unknown) {
  if (!(error instanceof ActivityNameConflict)) throw error;
  return new HttpResponse(error.message, { status: 409 });
}

export const activityBulkHandlers = [
  http.post("*/api/activities/rename", async ({ request }) => {
    if (!request.headers.get("x-auth-token"))
      return new HttpResponse(null, { status: 401 });
    const result = validateRenameBody(await request.json());
    if (!result.valid) return new HttpResponse(result.error, { status: 400 });
    try {
      const activities = Object.fromEntries(
        getActivities().map((entry) => [entry.id, entry])
      );
      const change = renameActivityName(
        activities,
        categoryMap(),
        result.data.oldName,
        result.data.newName,
        result.data
      );
      setActivities(
        Object.entries(change.activities).map(([id, entry]) => ({
          ...entry,
          id,
          categoryId: "",
          active: true,
        }))
      );
      saveCategories(change.categories);
      return HttpResponse.json({ updated: change.updated });
    } catch (error) {
      return conflictResponse(error);
    }
  }),
  http.post("*/api/activities/assign-category", async ({ request }) => {
    if (!request.headers.get("x-auth-token"))
      return new HttpResponse(null, { status: 401 });
    const result = validateAssignCategoryBody(await request.json());
    if (!result.valid) return new HttpResponse(result.error, { status: 400 });
    try {
      saveCategories(
        assignActivityName(
          categoryMap(),
          result.data.activityName,
          result.data.categoryId
        )
      );
      return HttpResponse.json({ ok: true });
    } catch (error) {
      return conflictResponse(error);
    }
  }),
  http.post("*/api/activities/reassign-category", async ({ request }) => {
    if (!request.headers.get("x-auth-token"))
      return new HttpResponse(null, { status: 401 });
    const result = validateReassignCategoryBody(await request.json());
    if (!result.valid) return new HttpResponse(result.error, { status: 400 });
    try {
      saveCategories(
        reassignCategory(
          categoryMap(),
          result.data.fromCategoryId,
          result.data.toCategoryId
        )
      );
      return HttpResponse.json({ ok: true });
    } catch (error) {
      return conflictResponse(error);
    }
  }),
  http.post("*/api/activities/delete-by-category", async ({ request }) => {
    if (!request.headers.get("x-auth-token"))
      return new HttpResponse(null, { status: 401 });
    const { categoryId } = (await request.json()) as { categoryId: string };
    const names = new Set(categoryMap()[categoryId]?.activityNames ?? []);
    const activities = getActivities();
    setActivities(activities.filter((entry) => !names.has(entry.name)));
    return HttpResponse.json({
      count: activities.length - getActivities().length,
    });
  }),
];
