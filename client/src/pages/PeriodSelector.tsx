import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  type ComparisonPeriod,
  MONTH_NAMES,
  PERIOD_COLORS,
  getPeriodLabel,
} from "./compare-utils";

type Props = {
  periods: ComparisonPeriod[];
  setPeriods: (
    updater:
      | ComparisonPeriod[]
      | ((prev: ComparisonPeriod[]) => ComparisonPeriod[])
  ) => void;
  availableYears: number[];
};

export function PeriodSelector({ periods, setPeriods, availableYears }: Props) {
  const [comparisonType, setComparisonType] = useState<"month" | "year">(
    "month"
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] ? String(availableYears[0]) : ""
  );

  const addPeriod = () => {
    if (periods.length >= 7) return;
    const year = Number(selectedYear);
    if (isNaN(year)) return;

    const id =
      comparisonType === "month"
        ? `${comparisonType}-${year}-${selectedMonth}`
        : `${comparisonType}-${year}`;

    if (periods.some((p) => p.id === id)) return;

    const color = PERIOD_COLORS[periods.length % PERIOD_COLORS.length];
    setPeriods([
      ...periods,
      {
        id,
        type: comparisonType,
        year,
        month: comparisonType === "month" ? selectedMonth : undefined,
        color,
      },
    ]);
  };

  const removePeriod = (id: string) => {
    setPeriods((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      return updated.map((p, i) => ({
        ...p,
        color: PERIOD_COLORS[i % PERIOD_COLORS.length],
      }));
    });
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Select Periods to Compare</CardTitle>
        <CardDescription>Choose up to 7 periods to analyze</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="compare-type">Comparison Type</Label>
            <Select
              value={comparisonType}
              onValueChange={(v) => setComparisonType(v as "month" | "year")}
            >
              <SelectTrigger id="compare-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="year">By Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {comparisonType === "month" && (
            <div className="space-y-2">
              <Label htmlFor="compare-month">Month</Label>
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger id="compare-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="compare-year">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="compare-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="invisible">Add</Label>
            <Button
              onClick={addPeriod}
              disabled={periods.length >= 7}
              className="w-full"
            >
              Add Period
            </Button>
          </div>
        </div>

        {periods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <Badge
                key={period.id}
                variant="secondary"
                className="gap-1.5 pr-1"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: period.color }}
                />
                {getPeriodLabel(period)}
                <button
                  onClick={() => removePeriod(period.id)}
                  aria-label={`Remove ${getPeriodLabel(period)}`}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
