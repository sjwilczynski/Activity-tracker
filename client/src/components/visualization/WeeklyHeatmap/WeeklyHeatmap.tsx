import { format } from "date-fns";
import { HeatmapCell } from "./HeatmapCell";
import { getMonthLabels, type WeeklyBucket } from "./weekly-heatmap-data";

const CELL_PX = 16;
const GAP_PX = 4;

type WeeklyHeatmapProps = {
  buckets: WeeklyBucket[];
  monthLabels?: (string | null)[];
};

function buildSummary(buckets: WeeklyBucket[]): string {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  if (total === 0) {
    return `Weekly activity heatmap. No active activities in the last ${buckets.length} weeks.`;
  }
  const busiest = buckets.reduce((max, bucket) =>
    bucket.count > max.count ? bucket : max
  );
  return `Weekly activity heatmap of the last ${buckets.length} weeks. ${total} active activities total. Busiest week of ${format(
    busiest.weekStart,
    "MMM d, yyyy"
  )} with ${busiest.count} activities.`;
}

export function WeeklyHeatmap({ buckets, monthLabels }: WeeklyHeatmapProps) {
  const labels = monthLabels ?? getMonthLabels(buckets);
  const gridTemplateColumns = `repeat(${buckets.length}, ${CELL_PX}px)`;

  return (
    <div className="overflow-x-auto pb-1">
      <p className="sr-only">{buildSummary(buckets)}</p>
      <div
        className="inline-flex flex-col gap-1"
        role="group"
        aria-label={`Weekly activity heatmap, last ${buckets.length} weeks`}
      >
        <div
          className="grid h-4 items-end text-[10px] leading-none text-muted-foreground"
          style={{ gridTemplateColumns, columnGap: `${GAP_PX}px` }}
          aria-hidden="true"
        >
          {labels.map((label, index) => (
            <span
              key={index}
              className="overflow-visible whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </div>
        <div
          className="grid"
          style={{ gridTemplateColumns, columnGap: `${GAP_PX}px` }}
        >
          {buckets.map((bucket) => (
            <HeatmapCell key={bucket.weekStart.getTime()} bucket={bucket} />
          ))}
        </div>
      </div>
    </div>
  );
}
