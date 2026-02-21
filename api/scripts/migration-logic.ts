/**
 * Shared migration logic — pure functions, no I/O.
 * Used by both the Firebase migration script and the local test script.
 */

export type OldSubcategory = {
  name: string;
  description: string;
};

export type OldCategory = {
  id?: number;
  name: string;
  active: boolean;
  description: string;
  subcategories?: OldSubcategory[];
};

export type OldActivity = {
  name: string;
  date: string;
  active: boolean;
};

export type NewCategory = {
  name: string;
  active: boolean;
  description: string;
  activityNames: string[];
};

export type NewActivity = {
  name: string;
  date: string;
  categoryId: string;
};

export type MigrationStats = {
  categoriesMigrated: number;
  activitiesMigrated: number;
  unmatchedActivityNames: string[];
};

export type MigrationResult = {
  categories: Record<string, NewCategory>;
  activities: Record<string, NewActivity>;
  stats: MigrationStats;
};

/**
 * Find the category key whose name or activityNames list matches the given activity name.
 */
export function findCategoryForActivity(
  activityName: string,
  categories: Map<string, NewCategory>
): string | undefined {
  const lowerName = activityName.toLowerCase();
  for (const [key, category] of categories) {
    if (
      category.name.toLowerCase() === lowerName ||
      category.activityNames.some((n) => n.toLowerCase() === lowerName)
    ) {
      return key;
    }
  }
  return undefined;
}

/**
 * Convert an old-format categories array (with potential nulls) into a new-format map.
 * Returns a Map of newKey → NewCategory.
 */
export function migrateCategories(
  oldCategories: (OldCategory | null)[],
  generateKey: () => string
): Map<string, NewCategory> {
  const result = new Map<string, NewCategory>();

  for (const cat of oldCategories) {
    if (cat === null || cat === undefined) continue;

    const newCategory: NewCategory = {
      name: cat.name,
      active: cat.active,
      description: cat.description || "",
      activityNames: cat.subcategories?.length
        ? cat.subcategories.map((s) => s.name)
        : [cat.name],
    };

    result.set(generateKey(), newCategory);
  }

  return result;
}

/**
 * Migrate activities: remove `active`, add `categoryId` by matching name to categories.
 */
export function migrateActivities(
  oldActivities: Record<string, OldActivity>,
  categories: Map<string, NewCategory>
): { activities: Record<string, NewActivity>; unmatched: string[] } {
  const activities: Record<string, NewActivity> = {};
  const unmatched: string[] = [];

  for (const [key, act] of Object.entries(oldActivities)) {
    const categoryId = findCategoryForActivity(act.name, categories);

    if (!categoryId) {
      unmatched.push(act.name);
    }

    activities[key] = {
      name: act.name,
      date: act.date,
      categoryId: categoryId || "",
    };
  }

  return { activities, unmatched };
}

/**
 * Full migration of a single user's data. Pure function — returns the new state.
 */
export function migrateUserData(
  userData: { categories?: unknown; activity?: unknown },
  generateKey: () => string
): MigrationResult {
  // 1. Migrate categories
  let newCategories: Map<string, NewCategory>;

  if (userData.categories && Array.isArray(userData.categories)) {
    newCategories = migrateCategories(userData.categories, generateKey);
  } else {
    newCategories = new Map();
  }

  // 2. Migrate activities
  const oldActivities = (userData.activity ?? {}) as Record<
    string,
    OldActivity
  >;
  const { activities, unmatched } = migrateActivities(
    oldActivities,
    newCategories
  );

  return {
    categories: Object.fromEntries(newCategories),
    activities,
    stats: {
      categoriesMigrated: newCategories.size,
      activitiesMigrated: Object.keys(activities).length,
      unmatchedActivityNames: [...new Set(unmatched)],
    },
  };
}
