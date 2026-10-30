import type { ActivityRecordWithIdServer } from "../../data/types";

const ACTIVITY_POOL = [
  { name: "Running", categoryId: "cat-sports", active: true },
  { name: "Swimming", categoryId: "cat-sports", active: true },
  { name: "Cycling", categoryId: "cat-sports", active: true },
  { name: "Yoga", categoryId: "cat-wellness", active: true },
  { name: "Meditation", categoryId: "cat-wellness", active: true },
  { name: "Reading", categoryId: "cat-learning", active: false },
] as const;

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function generateYearActivities(
  year: number,
  basePerMonth: number,
  idPrefix: string
): ActivityRecordWithIdServer[] {
  const seasonalMultiplier = [
    0.6, 0.6, 0.8, 1.0, 1.2, 1.4, 1.4, 1.2, 1.0, 0.8, 0.6, 0.5,
  ];
  const random = seededRandom(year * 1000 + basePerMonth);
  const result: ActivityRecordWithIdServer[] = [];
  let id = 0;
  for (let month = 0; month < 12; month++) {
    const count = Math.round(basePerMonth * seasonalMultiplier[month]);
    for (let index = 0; index < count; index++) {
      const day = Math.floor(random() * 28) + 1;
      const activity =
        ACTIVITY_POOL[Math.floor(random() * ACTIVITY_POOL.length)];
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      result.push({
        id: `${idPrefix}-${id++}`,
        date: `${year}-${mm}-${dd}`,
        ...activity,
      });
    }
  }
  return result;
}

export const multiYearActivities = [
  ...generateYearActivities(2024, 8, "y24"),
  ...generateYearActivities(2023, 6, "y23"),
  ...generateYearActivities(2022, 5, "y22"),
  ...generateYearActivities(2021, 7, "y21"),
  ...generateYearActivities(2020, 4, "y20"),
];
