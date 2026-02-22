import type {
  ActivitySummaries,
  ActivitySummary,
  CategoryOption,
} from "../../data";
import { darken, lighten } from "./color";

// 10 well-spaced hues for active categories
const ACTIVE_PALETTE = [
  "#2ecc40", // green
  "#3498db", // blue
  "#e67e22", // orange
  "#9b59b6", // purple
  "#1abc9c", // teal
  "#f1c40f", // yellow
  "#e84393", // pink
  "#00b894", // mint
  "#6c5ce7", // indigo
  "#fd79a8", // coral
];

export const activeBaseColor = "#2ecc40";
export const inactiveBaseColor = "#ff4136";

export type CategoryColorInfo = {
  activityToCategory: Map<string, string>;
  inactiveCategories: Set<string>;
  categoryActivities: Map<string, string[]>;
  categoryNames: string[];
  categoryBaseColor: Map<string, string>;
};

/** Shared logic: map activities to categories and assign base colors */
export function buildCategoryColorInfo(
  allSummaries: ActivitySummaries,
  categoryOptions: CategoryOption[]
): CategoryColorInfo {
  const activityToCategory = new Map<string, string>();
  const inactiveCategories = new Set<string>();
  for (const opt of categoryOptions) {
    activityToCategory.set(opt.name.toLowerCase(), opt.categoryName);
    if (!opt.active) inactiveCategories.add(opt.categoryName);
  }

  const categoryActivities = new Map<string, string[]>();
  for (const activityName of Object.keys(allSummaries)) {
    const category =
      activityToCategory.get(activityName.toLowerCase()) ?? "other";
    if (!categoryActivities.has(category)) {
      categoryActivities.set(category, []);
    }
    categoryActivities.get(category)!.push(activityName);
  }

  // Sort: active alphabetically, then inactive alphabetically, then "other"
  const categoryNames = [...categoryActivities.keys()].sort((a, b) => {
    if (a === "other") return 1;
    if (b === "other") return -1;
    const aInactive = inactiveCategories.has(a);
    const bInactive = inactiveCategories.has(b);
    if (aInactive !== bInactive) return aInactive ? 1 : -1;
    return a.localeCompare(b);
  });

  let activeIdx = 0;
  const categoryBaseColor = new Map<string, string>();
  for (const cat of categoryNames) {
    if (cat === "other") {
      categoryBaseColor.set(cat, "#94a3b8");
    } else if (inactiveCategories.has(cat)) {
      categoryBaseColor.set(cat, inactiveBaseColor);
    } else {
      categoryBaseColor.set(
        cat,
        ACTIVE_PALETTE[activeIdx % ACTIVE_PALETTE.length]
      );
      activeIdx++;
    }
  }

  return {
    activityToCategory,
    inactiveCategories,
    categoryActivities,
    categoryNames,
    categoryBaseColor,
  };
}

/** Get the color for a specific activity within its category */
export function getActivityColor(
  activityName: string,
  info: CategoryColorInfo
): string {
  const category =
    info.activityToCategory.get(activityName.toLowerCase()) ?? "other";
  const base = info.categoryBaseColor.get(category)!;
  const siblings = info.categoryActivities.get(category) ?? [];
  const actIdx = siblings.indexOf(activityName);
  const step =
    siblings.length > 1 ? (actIdx / (siblings.length - 1)) * 50 - 25 : 0;
  return step > 0 ? lighten(base, step) : darken(base, -step);
}

/** Hash-based color for flat mode (same palette as utils/colors.ts) */
const FLAT_PALETTE = [
  "#D4764E",
  "#5085BE",
  "#1E7A4E",
  "#D4A03C",
  "#CD6078",
  "#8b5cf6",
  "#06b6d4",
  "#e84393",
  "#2ecc40",
  "#fd79a8",
];

export function hashActivityColor(name: string): string {
  let hash = 0;
  const lower = name.toLowerCase().trim();
  for (let i = 0; i < lower.length; i++) {
    hash = (hash << 5) - hash + lower.charCodeAt(i);
    hash |= 0;
  }
  return FLAT_PALETTE[Math.abs(hash) % FLAT_PALETTE.length];
}

export const sortKeys = (activitySummaries: ActivitySummaries) =>
  Object.keys(activitySummaries).sort((key1, key2) => {
    const orderByActive =
      +activitySummaries[key2].active - +activitySummaries[key1].active;
    return orderByActive || key2.localeCompare(key1);
  });

export const getTotalActiveAndInactiveCount = (
  activitySummaries: ActivitySummaries
) => {
  const activeCount = getTotalCount(
    Object.values(activitySummaries).filter((s) => s.active)
  );
  const inactiveCount = getTotalCount(
    Object.values(activitySummaries).filter((s) => !s.active)
  );
  return { activeCount, inactiveCount };
};

export const getTotalCount = (summaries: ActivitySummary[]) =>
  summaries.reduce((sum, s) => sum + s.count, 0);
