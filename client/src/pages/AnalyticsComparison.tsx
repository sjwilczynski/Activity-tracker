import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComparisonChart } from "@/components/visualization/Charts/ComparisonChart";
import type { ActivityRecordWithId } from "@/data/types";
import {
  getComparisonOptions,
  getComparisonSeries,
  type ComparisonMode,
} from "./comparison-data";

export function AnalyticsComparison({
  records,
}: {
  records: ActivityRecordWithId[];
}) {
  const [mode, setMode] = useState<ComparisonMode>("years");
  const today = new Date();
  const referenceDate = records.reduce(
    (latest, record) => (record.date > latest ? record.date : latest),
    records[0]?.date ?? today
  );
  const options = getComparisonOptions(records, referenceDate);
  const periods = options.find((option) => option.id === mode)!.periods;
  return (
    <section aria-label="Period comparison" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <label htmlFor="analytics-comparison">Comparison</label>
        <select
          id="analytics-comparison"
          value={mode}
          className="h-9 rounded-md border bg-background px-2"
          onChange={(event) => {
            const option = options.find(
              (entry) => entry.id === event.target.value
            );
            if (option) setMode(option.id);
          }}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activity Comparison</CardTitle>
          <CardDescription>
            Compare entries in active categories across periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonChart
            series={getComparisonSeries(records, periods, today)}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Comparison uses its own selected periods, independent of the
            analytics date range. Choose individual periods on the Compare page.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
