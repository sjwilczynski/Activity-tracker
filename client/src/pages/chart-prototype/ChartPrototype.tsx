// Throwaway comparison on /charts?variant=baseline|parity|clarity; never a production route.
import { getRouteApi } from "@tanstack/react-router";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useDateRangeState } from "@/components/forms/DateFilterForm/shared";
import { ErrorView } from "@/components/states/ErrorView";
import { Loading } from "@/components/states/Loading";
import { Button } from "@/components/ui/button";
import {
  filterByDateRange,
  transformDataToSummaryMap,
  useActivities,
  useAvailableCategories,
} from "@/data";
import { getActivityPoints } from "./chart-model";
import {
  BaselineVariant,
  ClarityVariant,
  ParityVariant,
} from "./ChartVariants";
import { matchesScenario, scenarios, type Scenario } from "./fixtures";
import {
  PrototypeComparison,
  type ComparisonMode,
} from "./PrototypeComparison";
import "./prototype.css";
import {
  PrototypeSwitcher,
  variants,
  type PrototypeVariant,
} from "./PrototypeSwitcher";

const sampleData = import.meta.env.CHART_PROTOTYPE === true;

ChartJS.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip
);

export default function ChartPrototype({
  variant,
}: {
  variant: PrototypeVariant;
}) {
  const activities = useActivities();
  const categories = useAvailableCategories();
  const [dateRange, setDateRange] = useDateRangeState();
  const [scenario, setScenario] = useState<Scenario>("typical");
  const [grouped, setGrouped] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [comparison, setComparison] = useState<ComparisonMode>("years");
  const navigate = getRouteApi("/_authenticated/charts").useNavigate();
  const changeVariant = (value: PrototypeVariant) => {
    void navigate({
      search: (previous) => ({ ...previous, variant: value }),
      resetScroll: false,
      replace: true,
    });
  };
  if (activities.isLoading || categories.isLoading) return <Loading />;
  if (activities.error || categories.error)
    return <ErrorView error={activities.error ?? categories.error!} />;

  const scenarioRecords = (activities.data ?? []).filter(
    (record) =>
      !sampleData || matchesScenario(record.name, record.active, scenario)
  );
  const records = scenarioRecords.filter(
    (record) => showInactive || record.active
  );
  const filtered = filterByDateRange(
    records,
    dateRange.startDate,
    dateRange.endDate
  );
  const summaries = transformDataToSummaryMap(filtered);
  const allSummaries = transformDataToSummaryMap(records);
  const points = getActivityPoints(
    summaries,
    allSummaries,
    categories.availableCategories,
    grouped
  );
  const view = variants.find((entry) => entry.id === variant)!;
  const props = {
    points,
    summaries,
    allSummaries,
    categories: categories.availableCategories,
    grouped,
  };
  const popular = [...points]
    .filter((point) => point.active)
    .sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6 pb-24" data-prototype-variant={variant}>
      <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm">
        <strong>Chart prototype</strong> / {view.label}.{" "}
        {sampleData
          ? "Deterministic sample data through Oct 24, 2026. No live account or database is used in the prototype runner."
          : "Using your signed-in account's activities. Demo scenario filters are disabled."}
      </div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="heading-gradient text-2xl font-bold sm:text-3xl">
            Activity Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view.description}
          </p>
        </div>
        <DateRangePicker
          value={{ from: dateRange.startDate, to: dateRange.endDate }}
          onChange={(range) =>
            setDateRange({ startDate: range.from, endDate: range.to })
          }
        />
      </header>
      <div className="flex flex-wrap items-center gap-3">
        {sampleData && (
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="prototype-scenario">Scenario</label>
            <select
              id="prototype-scenario"
              value={scenario}
              className="h-9 max-w-[240px] rounded-md border bg-background px-2 text-sm"
              onChange={(event) => {
                const selected = scenarios.find(
                  (entry) => entry.id === event.target.value
                );
                if (selected) setScenario(selected.id);
              }}
            >
              {scenarios.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          aria-pressed={grouped}
          onClick={() => setGrouped(!grouped)}
        >
          {variant === "clarity" ? "Color by category" : "Group by category"}:{" "}
          {grouped ? "on" : "off"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={!showInactive}
          onClick={() => setShowInactive(!showInactive)}
        >
          Hide inactive: {showInactive ? "off" : "on"}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total Activities", filtered.length],
          ["Unique Activities", points.length],
          ["Most Popular", popular?.name ?? "None"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card px-5 py-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      {points.length ? (
        variant === "baseline" ? (
          <BaselineVariant {...props} />
        ) : variant === "parity" ? (
          <ParityVariant {...props} />
        ) : (
          <ClarityVariant {...props} />
        )
      ) : (
        <div role="status" className="rounded-xl border px-6 py-16 text-center">
          <p className="font-semibold">No activities in this selection</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sampleData
              ? "Choose another scenario or date range."
              : "Choose another date range or log an activity."}{" "}
            Empty charts are not drawn.
          </p>
        </div>
      )}
      <PrototypeComparison
        variant={variant}
        records={scenarioRecords}
        sampleData={sampleData}
        mode={comparison}
        onChange={setComparison}
      />
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">Prototype state</summary>
        <pre className="mt-2 overflow-auto rounded-lg bg-muted p-3">
          {JSON.stringify(
            {
              variant,
              dataSource: sampleData ? "sample" : "account",
              ...(sampleData ? { scenario } : {}),
              grouped,
              showInactive,
              dateRange,
              comparison,
              filteredCount: filtered.length,
              activities: points.length,
            },
            null,
            2
          )}
        </pre>
      </details>
      <PrototypeSwitcher variant={variant} onChange={changeVariant} />
    </div>
  );
}
