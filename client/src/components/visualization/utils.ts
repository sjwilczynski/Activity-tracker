import { TinyColor } from "@ctrl/tinycolor";
import type { ChartData } from "chart.js";
import type {
  ActivitySummaries,
  ActivitySummary,
  CategoryOption,
} from "../../data";

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

export const activeBaseColor = new TinyColor("#2ecc40");
export const inactiveBaseColor = new TinyColor("#ff4136");

type CategoryColorInfo = {
  activityToCategory: Map<string, string>;
  inactiveCategories: Set<string>;
  categoryActivities: Map<string, string[]>;
  categoryNames: string[];
  categoryBaseColor: Map<string, TinyColor>;
};

/** Shared logic: map activities to categories and assign base colors */
function buildCategoryColorInfo(
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
  const categoryBaseColor = new Map<string, TinyColor>();
  for (const cat of categoryNames) {
    if (cat === "other") {
      categoryBaseColor.set(cat, new TinyColor("#94a3b8"));
    } else if (inactiveCategories.has(cat)) {
      categoryBaseColor.set(
        cat,
        new TinyColor(inactiveBaseColor.toHexString())
      );
    } else {
      categoryBaseColor.set(
        cat,
        new TinyColor(ACTIVE_PALETTE[activeIdx % ACTIVE_PALETTE.length])
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
function getActivityColor(
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
  const color =
    step > 0 ? base.clone().lighten(step) : base.clone().darken(-step);
  return color.toHexString();
}

/** Build stacked bar chart data: one bar per category, stacked by activity.
 *  Uses allSummaries for stable structure/colors, filteredSummaries for counts. */
export function getStackedBarChartData(
  filteredSummaries: ActivitySummaries,
  allSummaries: ActivitySummaries,
  categoryOptions: CategoryOption[]
): ChartData<"bar", number[], string> {
  const info = buildCategoryColorInfo(allSummaries, categoryOptions);

  // Filter out categories with no data in the current filter
  const visibleCategoryNames = info.categoryNames.filter((cat) => {
    const activities = info.categoryActivities.get(cat) ?? [];
    return activities.some((name) => (filteredSummaries[name]?.count ?? 0) > 0);
  });

  const datasets = Object.keys(allSummaries).map((activityName) => ({
    label: activityName,
    data: visibleCategoryNames.map((cat) => {
      const activities = info.categoryActivities.get(cat) ?? [];
      if (!activities.includes(activityName)) return 0;
      return filteredSummaries[activityName]?.count ?? 0;
    }),
    backgroundColor: getActivityColor(activityName, info),
    stack: "stack",
  }));

  return { labels: visibleCategoryNames, datasets };
}

/** Build 3-ring pie chart data: inner=active/inactive, middle=categories, outer=activities */
export function getPieChartData(
  activitySummaries: ActivitySummaries,
  allSummaries: ActivitySummaries,
  categoryOptions: CategoryOption[]
): ChartData<"pie", number[], string> {
  const info = buildCategoryColorInfo(allSummaries, categoryOptions);

  // --- Inner ring: Active vs Inactive (slightly darker to differentiate from other rings) ---
  const { activeCount, inactiveCount } =
    getTotalActiveAndInactiveCount(activitySummaries);
  const innerDataset = {
    data: [activeCount, ...(inactiveCount > 0 ? [inactiveCount] : [])],
    backgroundColor: [
      activeBaseColor.clone().darken(10).toHexString(),
      ...(inactiveCount > 0
        ? [inactiveBaseColor.clone().darken(10).toHexString()]
        : []),
    ],
    label: "Active vs Inactive",
    weight: 0.3,
  };

  // --- Middle ring: Per-category totals (slightly darker than outer ring) ---
  const visibleCategories = info.categoryNames.filter((cat) => {
    const activities = info.categoryActivities.get(cat) ?? [];
    return activities.some((name) => (activitySummaries[name]?.count ?? 0) > 0);
  });
  const categoryData = visibleCategories.map((cat) => {
    const activities = info.categoryActivities.get(cat) ?? [];
    return activities.reduce(
      (sum, name) => sum + (activitySummaries[name]?.count ?? 0),
      0
    );
  });
  const categoryColors = visibleCategories.map((cat) =>
    info.categoryBaseColor.get(cat)!.clone().darken(5).toHexString()
  );
  const middleDataset = {
    data: categoryData,
    backgroundColor: categoryColors,
    label: "Categories",
    weight: 0.7,
    categoryLabels: visibleCategories,
  };

  // --- Outer ring: Per-activity ---
  // Activities ordered by category to align with the middle ring
  const orderedActivities: { name: string; count: number; color: string }[] =
    [];
  for (const cat of visibleCategories) {
    const activities = info.categoryActivities.get(cat) ?? [];
    for (const name of activities) {
      const count = activitySummaries[name]?.count ?? 0;
      if (count > 0) {
        orderedActivities.push({
          name,
          count,
          color: getActivityColor(name, info),
        });
      }
    }
  }
  const outerDataset = {
    data: orderedActivities.map((a) => a.count),
    backgroundColor: orderedActivities.map((a) => a.color),
    label: "Activities",
    weight: 1,
  };

  const innerLabels = ["Active", ...(inactiveCount > 0 ? ["Inactive"] : [])];
  (innerDataset as Record<string, unknown>).innerLabels = innerLabels;

  return {
    labels: orderedActivities.map((a) => a.name),
    datasets: [outerDataset, middleDataset, innerDataset],
  };
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
