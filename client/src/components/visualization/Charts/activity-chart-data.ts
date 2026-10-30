import type { ActivitySummaries, CategoryOption } from "@/data/types";
import { darken } from "../color";
import {
  activeBaseColor,
  buildCategoryColorInfo,
  getActivityColor,
  hashActivityColor,
  inactiveBaseColor,
} from "../utils";

export type ActivityPoint = {
  name: string;
  category: string;
  active: boolean;
  count: number;
  color: string;
};
type DistributionSlice = { name: string; count: number; color: string };
export type DistributionRing = {
  id: string;
  label: string;
  inner: number;
  outer: number;
  slices: DistributionSlice[];
};

export function getActivityPoints(
  summaries: ActivitySummaries,
  allSummaries: ActivitySummaries,
  categories: CategoryOption[],
  grouped: boolean
): ActivityPoint[] {
  const info = buildCategoryColorInfo(allSummaries, categories);
  const names = grouped
    ? info.categoryNames.flatMap(
        (category) => info.categoryActivities.get(category) ?? []
      )
    : Object.keys(summaries).sort(
        (a, b) => summaries[b].count - summaries[a].count || a.localeCompare(b)
      );
  return names
    .filter((name) => (summaries[name]?.count ?? 0) > 0)
    .map((name) => ({
      name,
      category: info.activityToCategory.get(name) ?? "other",
      active: summaries[name].active,
      count: summaries[name].count,
      color: grouped ? getActivityColor(name, info) : hashActivityColor(name),
    }));
}

export function getDistributionRings(
  points: ActivityPoint[],
  all: ActivitySummaries,
  categories: CategoryOption[],
  grouped: boolean
): DistributionRing[] {
  const info = buildCategoryColorInfo(all, categories);
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const active = points
    .filter((point) => point.active)
    .reduce((sum, point) => sum + point.count, 0);
  const status = [
    { name: "Active", count: active, color: darken(activeBaseColor, 10) },
    {
      name: "Inactive",
      count: total - active,
      color: darken(inactiveBaseColor, 10),
    },
  ].filter((slice) => slice.count > 0);
  const inner = grouped ? 0.15 : 0.3 / 1.3;
  return [
    {
      id: "activities",
      label: "Activities",
      inner: grouped ? 0.5 : inner,
      outer: 1,
      slices: points,
    },
    ...(grouped
      ? [
          {
            id: "categories",
            label: "Categories",
            inner,
            outer: 0.5,
            slices: info.categoryNames
              .map((name) => ({
                name,
                count: points
                  .filter((point) => point.category === name)
                  .reduce((sum, point) => sum + point.count, 0),
                color: darken(info.categoryBaseColor.get(name)!, 5),
              }))
              .filter((slice) => slice.count > 0),
          },
        ]
      : []),
    {
      id: "status",
      label: "Category status",
      inner: 0,
      outer: inner,
      slices: status,
    },
  ];
}
