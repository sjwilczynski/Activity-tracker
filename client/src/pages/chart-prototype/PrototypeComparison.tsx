import { useMemo } from "react";
import type { ActivityRecordWithId } from "@/data";
import { periodsFromParams } from "../compare-utils";
import { getComparisonSeries } from "./chart-model";
import { ComparisonDataTable } from "./ComparisonDataTable";
import { BaselineComparison, TanStackComparison } from "./ComparisonPlot";
import { prototypeAsOf } from "./fixtures";
import { KeyboardHint, PlotFrame } from "./PlotFrame";
import type { PrototypeVariant } from "./PrototypeSwitcher";

const comparisons = {
  years: "year-2025,year-2026",
  months: "month-2026-8,month-2026-9",
  crowded:
    "month-2026-3,month-2026-4,month-2026-5,month-2026-6,month-2026-7,month-2026-8,month-2026-9",
};
export type ComparisonMode = keyof typeof comparisons;

export function PrototypeComparison({
  variant,
  records,
  mode,
  onChange,
}: {
  variant: PrototypeVariant;
  records: ActivityRecordWithId[];
  mode: ComparisonMode;
  onChange: (mode: ComparisonMode) => void;
}) {
  const series = useMemo(
    () =>
      getComparisonSeries(
        records,
        periodsFromParams(comparisons[mode]),
        variant === "clarity" ? prototypeAsOf : undefined
      ),
    [records, mode, variant]
  );
  if (!records.length)
    return (
      <p
        role="status"
        className="rounded-lg border p-6 text-sm text-muted-foreground"
      >
        No activities to compare in this scenario.
      </p>
    );
  return (
    <section aria-label="Period comparison" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <label htmlFor="prototype-comparison">Comparison</label>
        <select
          id="prototype-comparison"
          value={mode}
          className="h-9 rounded-md border bg-background px-2"
          onChange={(event) => {
            const value = event.target.value;
            if (value === "years" || value === "months" || value === "crowded")
              onChange(value);
          }}
        >
          <option value="years">2025 vs 2026</option>
          <option value="months">September vs October 2026</option>
          <option value="crowded">Seven months (crowded)</option>
        </select>
      </div>
      <PlotFrame
        title={
          variant === "clarity"
            ? "How do your periods compare?"
            : "Activity Comparison"
        }
        description="Same active-category counts and weekly/monthly buckets as the Compare page."
      >
        {variant === "baseline" ? (
          <BaselineComparison series={series} />
        ) : (
          <TanStackComparison series={series} clarity={variant === "clarity"} />
        )}
        <p className="text-xs text-muted-foreground">
          Comparison uses its own selected periods, independent of the analytics
          date range. Sample data ends Oct 24, 2026; 2026 is not a complete
          year.
          {variant === "clarity" &&
            " Future buckets are omitted, not plotted as zero."}
        </p>
        {variant !== "baseline" && (
          <>
            <KeyboardHint />
            <ComparisonDataTable series={series} />
          </>
        )}
      </PlotFrame>
    </section>
  );
}
