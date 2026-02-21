import type { Category } from "../../data/types";

export const mockCategories: Category[] = [
  {
    id: "cat-sports",
    name: "Sports",
    active: true,
    description: "Physical activities and exercise",
    activityNames: ["Running", "Swimming", "Cycling"],
  },
  {
    id: "cat-wellness",
    name: "Wellness",
    active: true,
    description: "Mental and physical wellness activities",
    activityNames: ["Meditation", "Yoga"],
  },
  {
    id: "cat-learning",
    name: "Learning",
    active: false,
    description: "Educational and learning activities",
    activityNames: ["Reading", "Courses"],
  },
];
