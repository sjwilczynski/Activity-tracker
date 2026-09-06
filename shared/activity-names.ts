import { LIMITS } from "./constants";
import type { ActivityMap, CategoryMap, RenameOptions } from "./types";

export class ActivityNameConflict extends Error {}

export const normalizeActivityName = (name: string) =>
  name.trim().toLowerCase();

export type NameTarget = {
  name: string;
  categoryId: string;
  categoryName: string;
};

export function findRenameTarget(
  activities: Record<string, { name: string }>,
  categories: CategoryMap,
  oldName: string,
  newName: string
): NameTarget | undefined {
  const names = new Set([
    ...Object.values(activities).map((entry) => entry.name),
    ...Object.values(categories).flatMap(
      (category) => category.activityNames ?? []
    ),
  ]);
  const matches = [...names].filter(
    (name) =>
      name !== oldName &&
      normalizeActivityName(name) === normalizeActivityName(newName)
  );
  if (matches.length > 1) {
    throw new ActivityNameConflict(
      "Multiple activity names match. Resolve their names before merging."
    );
  }
  const name = matches[0];
  if (!name) return undefined;
  const owners = Object.entries(categories).filter(([, category]) =>
    (category.activityNames ?? []).includes(name)
  );
  if (owners.length > 1) {
    throw new ActivityNameConflict(
      "Target belongs to multiple categories. Reassign it before merging."
    );
  }
  return {
    name,
    categoryId: owners[0]?.[0] ?? "",
    categoryName: owners[0]?.[1].name ?? "Uncategorized",
  };
}

export function renameActivityName(
  activities: ActivityMap,
  categories: CategoryMap,
  oldName: string,
  newName: string,
  options: RenameOptions = {}
) {
  const target = findRenameTarget(activities, categories, oldName, newName);
  if (target && !options.merge) {
    throw new ActivityNameConflict(
      "This activity name already exists. Confirm a merge to continue."
    );
  }
  if (
    options.merge &&
    (!target ||
      target.categoryId !== options.targetCategoryId ||
      target.name !== newName)
  ) {
    throw new ActivityNameConflict(
      "Merge target changed. Review the activity names and confirm again."
    );
  }
  const sourceOwners = Object.values(categories).filter((category) =>
    (category.activityNames ?? []).includes(oldName)
  );
  const entries = Object.entries(activities);
  const updated = entries.filter(([, entry]) => entry.name === oldName).length;
  if (!updated && !sourceOwners.length) {
    throw new ActivityNameConflict("Source activity name no longer exists");
  }
  if (sourceOwners.length > 1 && !options.merge) {
    throw new ActivityNameConflict(
      "Source belongs to multiple categories. Reassign it before renaming."
    );
  }
  return {
    updated,
    activities: Object.fromEntries(
      entries.map(([id, entry]) => [
        id,
        entry.name === oldName ? { ...entry, name: newName } : entry,
      ])
    ),
    categories: Object.fromEntries(
      Object.entries(categories).map(([id, category]) => [
        id,
        {
          ...category,
          activityNames: options.merge
            ? (category.activityNames ?? []).filter((name) => name !== oldName)
            : (category.activityNames ?? []).map((name) =>
                name === oldName ? newName : name
              ),
        },
      ])
    ),
  };
}

/** Owns membership changes independently of the storage/HTTP adapter. */
export function assignActivityName(
  categories: CategoryMap,
  activityName: string,
  categoryId: string
): CategoryMap {
  const target = categories[categoryId];
  if (!target)
    throw new ActivityNameConflict("Target category no longer exists");
  const targetNames = target.activityNames ?? [];
  const names = targetNames.includes(activityName)
    ? targetNames
    : [...targetNames, activityName];
  if (names.length > LIMITS.MAX_ACTIVITY_NAMES_PER_CATEGORY) {
    throw new ActivityNameConflict(
      "Target category has too many activity names"
    );
  }

  return Object.fromEntries(
    Object.entries(categories).map(([id, category]) => [
      id,
      {
        ...category,
        activityNames:
          id === categoryId
            ? names
            : (category.activityNames ?? []).filter(
                (name) => name !== activityName
              ),
      },
    ])
  );
}

export function reassignCategory(
  categories: CategoryMap,
  fromCategoryId: string,
  toCategoryId: string
): CategoryMap {
  if (!categories[fromCategoryId] || !categories[toCategoryId]) {
    throw new ActivityNameConflict(
      "Source or target category no longer exists"
    );
  }
  if (fromCategoryId === toCategoryId) return categories;
  return (categories[fromCategoryId].activityNames ?? []).reduce(
    (current, name) => assignActivityName(current, name, toCategoryId),
    categories
  );
}
