import {
  Activity,
  Bike,
  Dribbble,
  Footprints,
  Mountain,
  Sun,
  Thermometer,
  Waves,
} from "lucide-react";

const activityIcons: Record<string, React.ReactNode> = {
  jogging: <Footprints className="size-4" />,
  swimming: <Waves className="size-4" />,
  cycling: <Bike className="size-4" />,
  football: <Dribbble className="size-4" />,
  yoga: <Sun className="size-4" />,
  hiking: <Mountain className="size-4" />,
  basketball: <Activity className="size-4" />,
  tennis: <Activity className="size-4" />,
  sick: <Thermometer className="size-4" />,
};

export function getActivityIcon(name: string): React.ReactNode {
  return activityIcons[name.toLowerCase()] || <Activity className="size-4" />;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
