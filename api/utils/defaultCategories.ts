import type { Category } from "./types";

export const defaultCategories: Category[] = [
  {
    name: "Running",
    active: true,
    description: "Running and jogging activities",
    activityNames: [
      "Running",
      "Trail Running",
      "Treadmill",
      "Interval Running",
    ],
  },
  {
    name: "Cycling",
    active: true,
    description: "Cycling and biking activities",
    activityNames: ["Cycling", "Mountain Biking", "Indoor Cycling", "Spinning"],
  },
  {
    name: "Swimming",
    active: true,
    description: "Swimming activities",
    activityNames: ["Swimming", "Pool Swimming", "Open Water"],
  },
  {
    name: "Gym & Strength",
    active: true,
    description: "Gym workouts and strength training",
    activityNames: [
      "Gym",
      "Weight Training",
      "CrossFit",
      "Bodyweight Training",
      "Personal Trainer",
    ],
  },
  {
    name: "Team Sports",
    active: true,
    description: "Team and ball sports",
    activityNames: [
      "Football",
      "Basketball",
      "Volleyball",
      "Tennis",
      "Badminton",
      "Squash",
      "Table Tennis",
    ],
  },
  {
    name: "Wellness",
    active: true,
    description: "Wellness and flexibility activities",
    activityNames: ["Yoga", "Pilates", "Stretching", "Meditation"],
  },
  {
    name: "Outdoor",
    active: true,
    description: "Outdoor and adventure activities",
    activityNames: [
      "Hiking",
      "Skiing",
      "Snowboarding",
      "Climbing",
      "Rowing",
      "Kayaking",
    ],
  },
  {
    name: "Other",
    active: true,
    description: "Other active pursuits",
    activityNames: ["Walking", "Dancing", "Martial Arts", "Other"],
  },
  {
    name: "Rest & Recovery",
    active: false,
    description: "Rest days and recovery periods",
    activityNames: ["Rest Day", "Sick", "Vacation", "Injury"],
  },
];
