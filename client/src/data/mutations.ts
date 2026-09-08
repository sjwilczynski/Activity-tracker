import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../auth/AuthContext";
import {
  addActivitiesMutationOptions,
  addActivityNameMutationOptions,
  addCategoryMutationOptions,
  assignActivityCategoryMutationOptions,
  deleteActivityMutationOptions,
  deleteAllActivitiesMutationOptions,
  deleteCategoryMutationOptions,
  editActivityMutationOptions,
  editCategoryMutationOptions,
  renameActivityMutationOptions,
  restoreBackupMutationOptions,
} from "./actions";

function useMutationContext() {
  const { getIdToken } = useAuthContext();
  const queryClient = useQueryClient();
  if (!getIdToken)
    throw new Error("Mutations require an authenticated session");
  return { queryClient, getAuthToken: getIdToken };
}

export function useAddActivities() {
  return useMutation(addActivitiesMutationOptions(useMutationContext()));
}

export function useEditActivity() {
  return useMutation(editActivityMutationOptions(useMutationContext()));
}

export function useDeleteActivity() {
  return useMutation(deleteActivityMutationOptions(useMutationContext()));
}

export function useDeleteAllActivities() {
  return useMutation(deleteAllActivitiesMutationOptions(useMutationContext()));
}

export function useRestoreBackup() {
  return useMutation(restoreBackupMutationOptions(useMutationContext()));
}

export function useAddCategory() {
  return useMutation(addCategoryMutationOptions(useMutationContext()));
}

export function useEditCategory() {
  return useMutation(editCategoryMutationOptions(useMutationContext()));
}

export function useDeleteCategory() {
  return useMutation(deleteCategoryMutationOptions(useMutationContext()));
}

export function useRenameActivity() {
  return useMutation(renameActivityMutationOptions(useMutationContext()));
}

export function useAssignActivityCategory() {
  return useMutation(
    assignActivityCategoryMutationOptions(useMutationContext())
  );
}

export function useAddActivityName() {
  return useMutation(addActivityNameMutationOptions(useMutationContext()));
}
