import type { ActivityRecordWithIdServer } from "../../data/types";

// Generate dates for the past 30 days
const generateDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

export const mockActivities: ActivityRecordWithIdServer[] = [
  { id: "1", date: generateDate(0), name: "Running", active: true },
  { id: "2", date: generateDate(1), name: "Swimming", active: true },
  { id: "3", date: generateDate(1), name: "Reading", active: false },
  { id: "4", date: generateDate(2), name: "Meditation", active: true },
  { id: "5", date: generateDate(2), name: "Running", active: true },
  { id: "6", date: generateDate(3), name: "Cycling", active: true },
  { id: "7", date: generateDate(3), name: "Yoga", active: true },
  { id: "8", date: generateDate(4), name: "Running", active: true },
  { id: "9", date: generateDate(4), name: "Reading", active: false },
  { id: "10", date: generateDate(5), name: "Swimming", active: true },
  { id: "11", date: generateDate(5), name: "Meditation", active: true },
  { id: "12", date: generateDate(6), name: "Running", active: true },
  { id: "13", date: generateDate(6), name: "Cycling", active: true },
  { id: "14", date: generateDate(7), name: "Yoga", active: true },
  { id: "15", date: generateDate(7), name: "Reading", active: false },
  { id: "16", date: generateDate(8), name: "Running", active: true },
  { id: "17", date: generateDate(8), name: "Swimming", active: true },
  { id: "18", date: generateDate(9), name: "Meditation", active: true },
  { id: "19", date: generateDate(9), name: "Cycling", active: true },
  { id: "20", date: generateDate(10), name: "Running", active: true },
  { id: "21", date: generateDate(10), name: "Yoga", active: true },
  { id: "22", date: generateDate(11), name: "Reading", active: false },
  { id: "23", date: generateDate(11), name: "Swimming", active: true },
  { id: "24", date: generateDate(12), name: "Running", active: true },
  { id: "25", date: generateDate(12), name: "Meditation", active: true },
  { id: "26", date: generateDate(13), name: "Cycling", active: true },
  { id: "27", date: generateDate(13), name: "Yoga", active: true },
  { id: "28", date: generateDate(14), name: "Running", active: true },
  { id: "29", date: generateDate(14), name: "Reading", active: false },
  { id: "30", date: generateDate(15), name: "Swimming", active: true },
];

export const createMockActivity = (
  overrides?: Partial<ActivityRecordWithIdServer>
): ActivityRecordWithIdServer => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString().split("T")[0],
  name: "New Activity",
  active: true,
  ...overrides,
});
