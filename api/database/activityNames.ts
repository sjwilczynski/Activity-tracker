import {
  ActivityNameConflict,
  assignActivityName,
  reassignCategory,
  renameActivityName,
} from "../../shared/activity-names";
import { database } from "../firebase/firebase";
import type { ActivityMap, CategoryMap, RenameOptions } from "../utils/types";

type StoredUser = { activity?: ActivityMap; categories?: CategoryMap };

async function transact<T>(
  path: string,
  change: (current: T) => T
): Promise<void> {
  let failure: { error: unknown } | undefined;
  const result = await database.ref(path).transaction((current: T | null) => {
    failure = undefined;
    // Null can be an empty local cache. Let Firebase compare with the server and retry.
    if (current === null) return null;
    try {
      return change(current);
    } catch (error) {
      // Throwing during an SDK retry can escape its promise. Abort, then rethrow below.
      failure = { error };
      return undefined;
    }
  });
  if (failure) throw failure.error;
  if (!result.committed || result.snapshot.val() === null) {
    throw new ActivityNameConflict(
      "Activity data no longer exists. Refresh and try again."
    );
  }
}

export async function bulkRenameActivities(
  userId: string,
  oldName: string,
  newName: string,
  options: RenameOptions = {}
): Promise<number> {
  let updated = 0;
  await transact<StoredUser>(`/users/${userId}`, (current) => {
    const change = renameActivityName(
      current.activity ?? {},
      current.categories ?? {},
      oldName,
      newName,
      options
    );
    updated = change.updated;
    return {
      ...current,
      activity: change.activities,
      categories: change.categories,
    };
  });
  return updated;
}

export async function bulkAssignCategory(
  userId: string,
  activityName: string,
  categoryId: string
): Promise<void> {
  await transact<CategoryMap>(`/users/${userId}/categories`, (current) =>
    assignActivityName(current, activityName, categoryId)
  );
}

export async function bulkReassignCategory(
  userId: string,
  fromCategoryId: string,
  toCategoryId: string
): Promise<void> {
  await transact<CategoryMap>(`/users/${userId}/categories`, (current) =>
    reassignCategory(current, fromCategoryId, toCategoryId)
  );
}
