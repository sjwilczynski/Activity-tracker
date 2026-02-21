import type { Intensity } from "../data/types";

export const intensityLabels: Record<Intensity, string> = {
  low: "Easy",
  medium: "Moderate",
  high: "Intense",
};

export const intensityStyles: Record<
  Intensity,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  low: {
    bg: "#E8F5E0",
    text: "#1E7A4E",
    darkBg: "rgba(30, 122, 78, 0.2)",
    darkText: "#4dab6e",
  },
  medium: {
    bg: "#EDF3FA",
    text: "#5085BE",
    darkBg: "rgba(80, 133, 190, 0.2)",
    darkText: "#6b9fd4",
  },
  high: {
    bg: "#FDE8E0",
    text: "#CD6078",
    darkBg: "rgba(205, 96, 120, 0.2)",
    darkText: "#e0839a",
  },
};
