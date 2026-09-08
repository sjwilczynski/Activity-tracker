import {
  activityQueries,
  categoryQueries,
  allQueries,
  addActivitiesPlan,
  addActivityNamePlan,
  addCategoryPlan,
  assignActivityCategoryPlan,
  deleteActivityPlan,
  deleteAllActivitiesPlan,
  deleteCategoryPlan,
  editActivityPlan,
  editCategoryPlan,
  renameActivityPlan,
  restoreBackupPlan,
} from "./action-plan";
import { writeMutationOptions, type MutationContext } from "./mutation-write";

export function addActivitiesMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "add-activities",
    addActivitiesPlan,
    activityQueries
  );
}

export function editActivityMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "edit-activity",
    editActivityPlan,
    activityQueries
  );
}

export function deleteActivityMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "delete-activity",
    deleteActivityPlan,
    activityQueries
  );
}

export function deleteAllActivitiesMutationOptions(context: MutationContext) {
  return writeMutationOptions<void>(
    context,
    "delete-all-activities",
    deleteAllActivitiesPlan,
    activityQueries
  );
}

export function restoreBackupMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "restore-backup",
    restoreBackupPlan,
    allQueries
  );
}

export function addCategoryMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "add-category",
    addCategoryPlan,
    categoryQueries
  );
}

export function editCategoryMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "edit-category",
    editCategoryPlan,
    categoryQueries
  );
}

export function deleteCategoryMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "delete-category",
    deleteCategoryPlan,
    categoryQueries
  );
}

export function renameActivityMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "rename-activity",
    renameActivityPlan,
    categoryQueries
  );
}

export function assignActivityCategoryMutationOptions(
  context: MutationContext
) {
  return writeMutationOptions(
    context,
    "assign-activity-category",
    assignActivityCategoryPlan,
    categoryQueries
  );
}

export function addActivityNameMutationOptions(context: MutationContext) {
  return writeMutationOptions(
    context,
    "add-activity-name",
    addActivityNamePlan,
    categoryQueries
  );
}
