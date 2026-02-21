import type { Category } from "./types";

export const defaultCategories: Category[] = [
  {
    name: "Running",
    active: true,
    description: "Running and jogging activities",
    activityNames: ["Running", "Treadmill"],
  },
  {
    name: "Cycling",
    active: true,
    description: "Cycling and biking activities",
    activityNames: ["Cycling", "Indoor Cycling", "Spinning"],
  },
  {
    name: "Swimming",
    active: true,
    description: "Swimming activities",
    activityNames: ["Swimming", "Open Water"],
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
    activityNames: ["Football", "Basketball", "Volleyball"],
  },
  {
    name: "Racket Sports",
    active: true,
    description: "Racket and paddle sports",
    activityNames: ["Tennis", "Badminton", "Squash", "Table Tennis"],
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
