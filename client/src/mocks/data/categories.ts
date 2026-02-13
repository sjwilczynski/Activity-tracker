import type { Category } from "../../data/types";

export const mockCategories: Category[] = [
  {
    id: "cat-sports",
    name: "Sports",
    active: true,
    description: "Physical activities and exercise",
    subcategories: [
      { name: "Running", description: "Outdoor or treadmill running" },
      { name: "Swimming", description: "Pool or open water swimming" },
      { name: "Cycling", description: "Road or mountain biking" },
    ],
  },
  {
    id: "cat-wellness",
    name: "Wellness",
    active: true,
    description: "Mental and physical wellness activities",
    subcategories: [
      {
        name: "Meditation",
        description: "Mindfulness and meditation practice",
      },
      { name: "Yoga", description: "Yoga sessions and stretching" },
    ],
  },
  {
    id: "cat-learning",
    name: "Learning",
    active: false,
    description: "Educational and learning activities",
    subcategories: [
      { name: "Reading", description: "Books, articles, and documentation" },
      { name: "Courses", description: "Online courses and tutorials" },
    ],
  },
];
