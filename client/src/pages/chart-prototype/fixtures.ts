import { format } from "date-fns";
import type { ActivityRecordWithIdServer, Category } from "@/data";

export const prototypeCategories: Category[] = [
  {
    id: "sports",
    name: "Sports",
    description: "Exercise and sports",
    active: true,
    activityNames: ["Running", "Cycling", "Swimming", "Strength training"],
  },
  {
    id: "wellness",
    name: "Wellness",
    description: "Restorative routines",
    active: true,
    activityNames: ["Meditation", "Yoga", "Walking & hiking"],
  },
  {
    id: "learning",
    name: "Learning",
    description: "An inactive category with historical entries",
    active: false,
    activityNames: ["Reading", "Courses"],
  },
  {
    id: "adventures",
    name: "Outdoor adventures",
    description: "Long names for responsive-layout evaluation",
    active: true,
    activityNames: [
      "Long-distance trail running",
      "Weekend mountain bike adventures",
      "Indoor climbing & bouldering",
      "Open-water swimming practice",
      "Strength, balance & mobility",
    ],
  },
];

const weightedNames = [
  "Running",
  "Running",
  "Running",
  "Running",
  "Running",
  "Running",
  "Cycling",
  "Cycling",
  "Cycling",
  "Swimming",
  "Strength training",
  "Meditation",
  "Meditation",
  "Yoga",
  "Walking & hiking",
  "Reading",
  "Courses",
  "Long-distance trail running",
  "Weekend mountain bike adventures",
  "Indoor climbing & bouldering",
  "Open-water swimming practice",
  "Strength, balance & mobility",
  "Uncategorized activity",
];

export const prototypeActivities: ActivityRecordWithIdServer[] = [];
export const prototypeAsOf = new Date(2026, 9, 24);
for (let day = 0; ; day++) {
  const date = new Date(2024, 0, day + 1);
  if (date > prototypeAsOf) break;
  const sessions = day % 7 === 0 ? 0 : 1 + (day % 3);
  for (let session = 0; session < sessions; session++) {
    const name = weightedNames[(day * 7 + session * 11) % weightedNames.length];
    const category = prototypeCategories.find((entry) =>
      entry.activityNames.includes(name)
    );
    prototypeActivities.push({
      id: `prototype-${day}-${session}`,
      name,
      date: format(date, "yyyy-MM-dd"),
      categoryId: category?.id ?? "",
      active: category?.active ?? true,
    });
  }
}

export type Scenario = "typical" | "dense" | "single" | "inactive" | "empty";
export const scenarios: { id: Scenario; label: string }[] = [
  { id: "typical", label: "Everyday activities" },
  { id: "dense", label: "Many activities / long names" },
  { id: "single", label: "Single activity" },
  { id: "inactive", label: "Inactive categories only" },
  { id: "empty", label: "No data" },
];

export function matchesScenario(
  name: string,
  active: boolean,
  scenario: Scenario
) {
  switch (scenario) {
    case "empty":
      return false;
    case "single":
      return name === "Running";
    case "inactive":
      return !active;
    case "typical":
      return prototypeCategories
        .slice(0, 3)
        .some((category) => category.activityNames.includes(name));
    case "dense":
      return true;
  }
}
