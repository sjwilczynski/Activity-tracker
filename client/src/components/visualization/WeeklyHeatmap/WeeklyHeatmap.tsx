import { format } from "date-fns";
import { useId } from "react";
import { HeatmapCell } from "./HeatmapCell";
import { getMonthLabels, type WeeklyBucket } from "./weekly-heatmap-data";

const GAP_PX = 4;
/** Vertical room reserved above every cell for the per-cell month label. */
const LABEL_SPACE_PX = 16;

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
  const summaryId = useId();

  return (
    <div className="pb-1">
      <p id={summaryId} className="sr-only">
        {buildSummary(buckets)}
      </p>
      {/*
        Continuous strip that WRAPS instead of horizontal-scrolling: on wide
        containers all 52 weeks sit on one GitHub-style row; on narrow screens
        they flow onto further rows. Each month's first cell carries its own
        label in the reserved space above it (absolute, relative to the cell),
        so month markers stay correctly positioned no matter where they wrap.
      */}
      <div
        className="flex flex-wrap"
        role="group"
        aria-label={`Weekly activity heatmap, last ${buckets.length} weeks`}
        aria-describedby={summaryId}
        style={{ columnGap: `${GAP_PX}px`, rowGap: 0 }}
      >
        {buckets.map((bucket, index) => (
          <div
            key={bucket.weekStart.getTime()}
            className="relative"
            style={{ marginTop: `${LABEL_SPACE_PX}px` }}
          >
            {labels[index] && (
              <span
                aria-hidden="true"
                className="absolute -top-[14px] left-0 text-[10px] leading-none text-muted-foreground whitespace-nowrap"
              >
                {labels[index]}
              </span>
            )}
            <HeatmapCell bucket={bucket} />
          </div>
        ))}
      </div>
    </div>
  );
}
