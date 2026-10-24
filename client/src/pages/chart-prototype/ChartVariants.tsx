import { barX } from "@tanstack/charts/bar";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { defineChart } from "@tanstack/charts/scene";
import { tooltip } from "@tanstack/charts/tooltip";
import { useMemo } from "react";
import { useIsLightTheme } from "@/components/styles/StylesProvider";
import { BarChart } from "@/components/visualization/Charts/BarChart";
import { SummaryPieChart } from "@/components/visualization/SummaryCharts/SummaryPieChart";
import { buildCategoryColorInfo } from "@/components/visualization/utils";
import type { ActivitySummaries, CategoryOption } from "@/data";
import { accessiblePlotColors } from "./chart-colors";
import { getCategorySlices, type ActivityPoint } from "./chart-model";
import {
  ActivityDataTable,
  KeyboardHint,
  PlotFrame,
  plotTheme,
} from "./PlotFrame";
import { TanStackDistribution } from "./TanStackDistribution";
import { RankedActivityPlot, TanStackFrequency } from "./TanStackFrequency";

export type VariantProps = {
  points: ActivityPoint[];
  summaries: ActivitySummaries;
  allSummaries: ActivitySummaries;
  categories: CategoryOption[];
  grouped: boolean;
};

export function BaselineVariant({
  summaries,
  allSummaries,
  categories,
  grouped,
}: VariantProps) {
  const props = {
    activitySummaries: summaries,
    allSummaries,
    categoryOptions: categories,
    groupByCategory: grouped,
  };
  return (
    <div className="space-y-6">
      <PlotFrame
        title="Activity Frequency"
        description="Number of times each activity was logged"
      >
        <div className="relative h-[400px]">
          <BarChart {...props} />
        </div>
      </PlotFrame>
      <PlotFrame
        title="Activity Distribution"
        description="Breakdown by type and active vs inactive"
      >
        <div className="relative h-[400px]">
          <SummaryPieChart {...props} />
        </div>
      </PlotFrame>
    </div>
  );
}

export function ParityVariant(props: VariantProps) {
  return (
    <div className="space-y-6">
      <PlotFrame
        title="Activity Frequency"
        description="Number of times each activity was logged"
      >
        <TanStackFrequency points={props.points} grouped={props.grouped} />
        <KeyboardHint legend={false} />
      </PlotFrame>
      <PlotFrame
        title="Activity Distribution"
        description="Breakdown by type and current category status"
      >
        <TanStackDistribution
          points={props.points}
          allSummaries={props.allSummaries}
          categories={props.categories}
          grouped={props.grouped}
        />
        <KeyboardHint />
      </PlotFrame>
      <ActivityDataTable points={props.points} />
    </div>
  );
}

function CategorySharePlot({ points, allSummaries, categories }: VariantProps) {
  const slices = useMemo(
    () =>
      getCategorySlices(points, allSummaries, categories).map((slice) => ({
        ...slice,
        color: points.find((point) => point.category === slice.name)!.color,
      })),
    [points, allSummaries, categories]
  );
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          barX(slices, {
            x: "count",
            y: () => "All activities",
            z: "name",
            key: "name",
            fill: (slice) => slice.color,
          }),
        ],
        scales: {
          x: { scale: scaleLinear().domain([0, total]), axis: false },
          y: { scale: () => scaleBand<string>().padding(0.15), axis: false },
        },
        margin: 0,
        theme: plotTheme,
        tooltip: {
          use: tooltip,
          format: (point) =>
            `${point.datum.name}: ${point.datum.count} activities (${((point.datum.count / total) * 100).toFixed(1)}%)`,
        },
      }),
    [slices, total]
  );
  return (
    <>
      <div data-chart-surface>
        <Chart
          definition={definition}
          height={55}
          ariaLabel="Share of activities by category"
          ariaDescription={`Category totals sum to ${total} logged activities. Exact values are listed below.`}
        />
      </div>
      <dl className="space-y-3">
        {slices.map((slice) => (
          <div
            key={slice.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <dt className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: slice.color }}
              />
              {slice.name}
            </dt>
            <dd className="shrink-0 text-right tabular-nums">
              <strong>{slice.count}</strong>
              <span className="ml-2 text-muted-foreground">
                {((slice.count / total) * 100).toFixed(1)}%
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function ClarityVariant(props: VariantProps) {
  const light = useIsLightTheme();
  const categoryNames = buildCategoryColorInfo(
    props.allSummaries,
    props.categories
  ).categoryNames;
  const categoryPoints = props.points.map((point) => ({
    ...point,
    color:
      accessiblePlotColors(light)[categoryNames.indexOf(point.category) % 7],
  }));
  const points = props.grouped
    ? categoryPoints
    : categoryPoints.map((point) => ({
        ...point,
        color: accessiblePlotColors(light)[0],
      }));
  const total = props.points.reduce((sum, point) => sum + point.count, 0);
  const active = props.points
    .filter((point) => point.active)
    .reduce((sum, point) => sum + point.count, 0);
  const leader = [...props.points].sort((a, b) => b.count - a.count)[0];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-l-4 border-primary bg-primary/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Your activity pattern
        </p>
        <p className="mt-1 text-lg font-semibold">
          {leader.name} leads with {leader.count} logged activities.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {((leader.count / total) * 100).toFixed(1)}% of the selected {total}{" "}
          entries. Counts describe frequency, not duration or effort.
        </p>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
        <PlotFrame
          title="What do you do most often?"
          description="Ranked from most to least frequent. Counts are shown beside each bar."
        >
          <RankedActivityPlot points={points} />
          <KeyboardHint legend={false} />
          <ActivityDataTable points={props.points} />
        </PlotFrame>
        <aside className="space-y-5" aria-label="Activity mix summaries">
          <PlotFrame
            title="Which categories make up your activities?"
            description="One total, divided into clearly labeled category shares."
          >
            <CategorySharePlot {...props} points={categoryPoints} />
          </PlotFrame>
          <PlotFrame
            title="Current category status"
            description="A separate view instead of a second meaning inside the same pie."
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-2xl font-bold tabular-nums">{active}</p>
                <p className="text-xs text-muted-foreground">
                  Entries in active categories
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-2xl font-bold tabular-nums">
                  {total - active}
                </p>
                <p className="text-xs text-muted-foreground">
                  Entries in inactive categories
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              These are logged-activity counts. Inactive means the category is
              currently disabled, not that the session was less physically
              active.
            </p>
          </PlotFrame>
        </aside>
      </div>
    </div>
  );
}
