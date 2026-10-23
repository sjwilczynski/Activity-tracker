import { validateImportData, type BackupData } from "../../../shared/backup";
import type { Category } from "../../../shared/types";
import {
  validateActivityBatch,
  validateActivityRecord,
  validateAddActivityNameBody,
  validateAssignCategoryBody,
  validateCategory,
  validateCategoryId,
  validateDeleteByCategoryBody,
  validateReassignCategoryBody,
  validateRenameBody,
  type ValidationResult,
} from "../../../shared/validators";
import type { WriteStep } from "./mutation-write";
import {
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
  getCategoriesQueryId,
  getPreferencesQueryId,
} from "./react-query-config/query-constants";
import type { ActivityRecordServer } from "./types";

export const activityQueries = [
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
];
export const categoryQueries = [...activityQueries, getCategoriesQueryId];
export const allQueries = [...categoryQueries, getPreferencesQueryId];

function validated<T>(result: ValidationResult & { data?: T }): T {
  if (!result.valid) throw new Error(result.error);
  return result.data!;
}

function pathId(id: string) {
  const result = validateCategoryId(id);
  if (!result.valid) throw new Error(result.error);
  return encodeURIComponent(id);
}

export function addActivitiesPlan(
  records: ActivityRecordServer[]
): WriteStep[] {
  validated(validateActivityBatch(records));
  return [
    {
      path: "/api/activities",
      method: "POST",
      body: records,
      invalidates: activityQueries,
    },
  ];
}

export function editActivityPlan({
  id,
  record,
}: {
  id: string;
  record: ActivityRecordServer;
}): WriteStep[] {
  validated(validateActivityRecord(record));
  return [
    {
      path: `/api/activities/${pathId(id)}`,
      method: "PUT",
      body: record,
      invalidates: activityQueries,
    },
  ];
}

export function deleteActivityPlan(id: string): WriteStep[] {
  return [
    {
      path: `/api/activities/${pathId(id)}`,
      method: "DELETE",
      invalidates: activityQueries,
    },
  ];
}

export function deleteAllActivitiesPlan(): WriteStep[] {
  return [
    { path: "/api/activities", method: "DELETE", invalidates: activityQueries },
  ];
}

export function restoreBackupPlan(backup: BackupData): WriteStep[] {
  validated(validateImportData(backup));
  return [
    {
      path: "/api/import",
      method: "POST",
      body: backup,
      invalidates: allQueries,
    },
  ];
}

export function addCategoryPlan(category: Category): WriteStep[] {
  return [
    {
      path: "/api/categories",
      method: "POST",
      body: validated(validateCategory(category)),
      invalidates: categoryQueries,
    },
  ];
}

export function editCategoryPlan({
  id,
  category,
}: {
  id: string;
  category: Category;
}): WriteStep[] {
  return [
    {
      path: `/api/categories/${pathId(id)}`,
      method: "PUT",
      body: validated(
        validateCategory(category, { preserveActivityNameIdentities: true })
      ),
      invalidates: categoryQueries,
    },
  ];
}

type DeleteCategory = { id: string } & (
  | { mode: "delete" }
  | { mode: "reassign"; targetCategoryId: string }
);

export function deleteCategoryPlan(command: DeleteCategory): WriteStep[] {
  const path = `/api/categories/${pathId(command.id)}`;
  if (command.mode === "delete") {
    return [
      {
        path: "/api/activities/delete-by-category",
        method: "POST",
        body: validated(
          validateDeleteByCategoryBody({ categoryId: command.id })
        ),
        invalidates: activityQueries,
      },
      {
        path,
        method: "DELETE",
        invalidates: categoryQueries,
        failureContext:
          "Activities deleted, but the category could not be deleted. ",
      },
    ];
  }
  if (command.mode !== "reassign")
    throw new Error("Invalid category deletion mode");
  return [
    {
      path: "/api/activities/reassign-category",
      method: "POST",
      body: validated(
        validateReassignCategoryBody({
          fromCategoryId: command.id,
          toCategoryId: command.targetCategoryId,
        })
      ),
      invalidates: categoryQueries,
    },
    {
      path,
      method: "DELETE",
      invalidates: categoryQueries,
      failureContext:
        "Activities reassigned, but the category could not be deleted. ",
    },
  ];
}

type RenameActivity = { oldName: string; newName: string } & (
  | { merge?: false; targetCategoryId?: never }
  | { merge: true; targetCategoryId: string }
);

export function renameActivityPlan(command: RenameActivity): WriteStep[] {
  return [
    {
      path: "/api/activities/rename",
      method: "POST",
      body: validated(validateRenameBody(command)),
      invalidates: categoryQueries,
    },
  ];
}

export function assignActivityCategoryPlan(command: {
  activityName: string;
  categoryId: string;
}): WriteStep[] {
  return [
    {
      path: "/api/activities/assign-category",
      method: "POST",
      body: validated(validateAssignCategoryBody(command)),
      invalidates: categoryQueries,
    },
  ];
}

export function addActivityNamePlan(command: {
  activityName: string;
  categoryId: string;
}): WriteStep[] {
  return [
    {
      path: `/api/categories/${pathId(command.categoryId)}/activity-names`,
      method: "POST",
      body: validated(validateAddActivityNameBody(command)),
      invalidates: categoryQueries,
    },
  ];
}
