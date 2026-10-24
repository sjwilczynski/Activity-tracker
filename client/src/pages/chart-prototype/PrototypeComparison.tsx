import { format } from "date-fns";
import type { ActivityRecordWithId } from "@/data";
import {
  getComparisonOptions,
  getComparisonSeries,
  type ComparisonMode,
} from "./chart-model";
import { ComparisonDataTable } from "./ComparisonDataTable";
import { BaselineComparison, TanStackComparison } from "./ComparisonPlot";
import { prototypeAsOf } from "./fixtures";
import { KeyboardHint, PlotFrame } from "./PlotFrame";
import type { PrototypeVariant } from "./PrototypeSwitcher";

export type { ComparisonMode } from "./chart-model";

export function PrototypeComparison({
  variant,
  records,
  mode,
  onChange,
  sampleData,
}: {
  variant: PrototypeVariant;
  records: ActivityRecordWithId[];
  mode: ComparisonMode;
  onChange: (mode: ComparisonMode) => void;
  sampleData: boolean;
}) {
  const today = new Date();
  const referenceDate = sampleData
    ? prototypeAsOf
    : records.reduce(
        (latest, record) => (record.date > latest ? record.date : latest),
        records[0]?.date ?? today
      );
  const options = getComparisonOptions(records, referenceDate);
  const periods = options.find((option) => option.id === mode)!.periods;
  const cutoff = sampleData ? prototypeAsOf : today;
  const series = getComparisonSeries(
    records,
    periods,
    variant === "clarity" ? cutoff : undefined
  );
  if (!records.length)
    return (
      <p
        role="status"
        className="rounded-lg border p-6 text-sm text-muted-foreground"
      >
        No activities to compare{sampleData ? " in this scenario" : ""}.
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
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
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
          date range.{" "}
          {sampleData
            ? "Sample data ends Oct 24, 2026; 2026 is not a complete year."
            : `Periods are selected from your recorded history; monthly comparisons end in ${format(referenceDate, "MMMM yyyy")}.`}
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
