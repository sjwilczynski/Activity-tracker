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
import { defineWriteMutation } from "./mutation-write";

export const addActivitiesMutationOptions = defineWriteMutation(
  "add-activities",
  addActivitiesPlan,
  activityQueries
);

export const editActivityMutationOptions = defineWriteMutation(
  "edit-activity",
  editActivityPlan,
  activityQueries
);

export const deleteActivityMutationOptions = defineWriteMutation(
  "delete-activity",
  deleteActivityPlan,
  activityQueries
);

export const deleteAllActivitiesMutationOptions = defineWriteMutation<void>(
  "delete-all-activities",
  deleteAllActivitiesPlan,
  activityQueries
);

export const restoreBackupMutationOptions = defineWriteMutation(
  "restore-backup",
  restoreBackupPlan,
  allQueries
);

export const addCategoryMutationOptions = defineWriteMutation(
  "add-category",
  addCategoryPlan,
  categoryQueries
);

export const editCategoryMutationOptions = defineWriteMutation(
  "edit-category",
  editCategoryPlan,
  categoryQueries
);

export const deleteCategoryMutationOptions = defineWriteMutation(
  "delete-category",
  deleteCategoryPlan,
  categoryQueries
);

export const renameActivityMutationOptions = defineWriteMutation(
  "rename-activity",
  renameActivityPlan,
  categoryQueries
);

export const assignActivityCategoryMutationOptions = defineWriteMutation(
  "assign-activity-category",
  assignActivityCategoryPlan,
  categoryQueries
);

export const addActivityNameMutationOptions = defineWriteMutation(
  "add-activity-name",
  addActivityNamePlan,
  categoryQueries
);
