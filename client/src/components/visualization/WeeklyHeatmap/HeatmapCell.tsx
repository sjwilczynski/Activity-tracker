import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import { levelBackground } from "./heatmap-colors";
import type { WeeklyBucket } from "./weekly-heatmap-data";

type HeatmapCellProps = {
  bucket: WeeklyBucket;
};

function activityLabel(count: number): string {
  return `${count} ${count === 1 ? "activity" : "activities"}`;
}

export function HeatmapCell({ bucket }: HeatmapCellProps) {
  const weekOf = format(bucket.weekStart, "MMM d, yyyy");
  const range = `${format(bucket.weekStart, "MMM d")} – ${format(
    bucket.weekEnd,
    "MMM d, yyyy"
  )}`;
  const label = `Week of ${weekOf}: ${activityLabel(bucket.count)}`;

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={label}
        data-level={bucket.level}
        className={cn(
          "size-[16px] rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]",
          "outline-hidden transition-transform focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-1 focus-visible:ring-offset-background hover:scale-110"
        )}
        style={{ backgroundColor: levelBackground(bucket.level) }}
      />
      <TooltipContent>
        <span className="font-medium">{range}</span>
        <span className="block tabular-nums">{activityLabel(bucket.count)}</span>
      </TooltipContent>
    </Tooltip>
  );
}
