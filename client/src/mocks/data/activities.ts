import type { ActivityRecordWithIdServer } from "../../data/types";

// Fixed reference date to ensure stable mocks for visual regression testing
export const REFERENCE_DATE = new Date("2024-02-10T12:00:00.000Z");

// Generate dates for the past 30 days
const generateDate = (daysAgo: number): string => {
  const date = new Date(REFERENCE_DATE);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

export const mockActivities: ActivityRecordWithIdServer[] = [
  { id: "1", date: generateDate(0), name: "Running", categoryId: "cat-sports", active: true, intensity: "high", timeSpent: 45, description: "Morning run in the park, felt great!" },
  {
    id: "2",
    date: generateDate(1),
    name: "Swimming",
    categoryId: "cat-sports",
    active: true,
    timeSpent: 60,
  },
  {
    id: "3",
    date: generateDate(1),
    name: "Reading",
    categoryId: "cat-learning",
    active: false,
    description: "Finished chapter 5 of Clean Code",
  },
  {
    id: "4",
    date: generateDate(2),
    name: "Meditation",
    categoryId: "cat-wellness",
    active: true,
    intensity: "low",
    timeSpent: 20,
  },
  { id: "5", date: generateDate(2), name: "Running", categoryId: "cat-sports", active: true, intensity: "medium", timeSpent: 30 },
  { id: "6", date: generateDate(3), name: "Cycling", categoryId: "cat-sports", active: true, intensity: "high", timeSpent: 90, description: "Long ride through the countryside" },
  { id: "7", date: generateDate(3), name: "Yoga", categoryId: "cat-wellness", active: true, intensity: "low", timeSpent: 45 },
  { id: "8", date: generateDate(4), name: "Running", categoryId: "cat-sports", active: true },
  {
    id: "9",
    date: generateDate(4),
    name: "Reading",
    categoryId: "cat-learning",
    active: false,
  },
  {
    id: "10",
    date: generateDate(5),
    name: "Swimming",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "11",
    date: generateDate(5),
    name: "Meditation",
    categoryId: "cat-wellness",
    active: true,
  },
  {
    id: "12",
    date: generateDate(6),
    name: "Running",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "13",
    date: generateDate(6),
    name: "Cycling",
    categoryId: "cat-sports",
    active: true,
  },
  { id: "14", date: generateDate(7), name: "Yoga", categoryId: "cat-wellness", active: true },
  {
    id: "15",
    date: generateDate(7),
    name: "Reading",
    categoryId: "cat-learning",
    active: false,
  },
  {
    id: "16",
    date: generateDate(8),
    name: "Running",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "17",
    date: generateDate(8),
    name: "Swimming",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "18",
    date: generateDate(9),
    name: "Meditation",
    categoryId: "cat-wellness",
    active: true,
  },
  {
    id: "19",
    date: generateDate(9),
    name: "Cycling",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "20",
    date: generateDate(10),
    name: "Running",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "21",
    date: generateDate(10),
    name: "Yoga",
    categoryId: "cat-wellness",
    active: true,
  },
  {
    id: "22",
    date: generateDate(11),
    name: "Reading",
    categoryId: "cat-learning",
    active: false,
  },
  {
    id: "23",
    date: generateDate(11),
    name: "Swimming",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "24",
    date: generateDate(12),
    name: "Running",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "25",
    date: generateDate(12),
    name: "Meditation",
    categoryId: "cat-wellness",
    active: true,
  },
  {
    id: "26",
    date: generateDate(13),
    name: "Cycling",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "27",
    date: generateDate(13),
    name: "Yoga",
    categoryId: "cat-wellness",
    active: true,
  },
  {
    id: "28",
    date: generateDate(14),
    name: "Running",
    categoryId: "cat-sports",
    active: true,
  },
  {
    id: "29",
    date: generateDate(14),
    name: "Reading",
    categoryId: "cat-learning",
    active: false,
  },
  {
    id: "30",
    date: generateDate(15),
    name: "Swimming",
    categoryId: "cat-sports",
    active: true,
  },
];

export const createMockActivity = (
  overrides?: Partial<ActivityRecordWithIdServer>
): ActivityRecordWithIdServer => ({
  id: crypto.randomUUID(),
  date: REFERENCE_DATE.toISOString().split("T")[0],
  name: "New Activity",
  categoryId: "cat-sports",
  active: true,
  ...overrides,
});
