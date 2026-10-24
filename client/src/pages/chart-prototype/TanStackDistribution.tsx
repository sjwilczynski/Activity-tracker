import { pie, polar, radialArc } from "@tanstack/charts/polar";
import { Chart } from "@tanstack/charts/react";
import { defineChart } from "@tanstack/charts/scene";
import { tooltip } from "@tanstack/charts/tooltip";
import { useMemo, useState } from "react";
import type { ActivitySummaries, CategoryOption } from "@/data";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDistributionRings, type ActivityPoint } from "./chart-model";
import { ChartLegend, plotAnimation, plotTheme } from "./PlotFrame";

export function TanStackDistribution({
  points,
  allSummaries,
  categories,
  grouped,
}: {
  points: ActivityPoint[];
  allSummaries: ActivitySummaries;
  categories: CategoryOption[];
  grouped: boolean;
}) {
  const [hidden, setHidden] = useState<string[]>([]);
  const mobile = useIsMobile();
  const visible = useMemo(
    () => points.filter((point) => !hidden.includes(point.name)),
    [points, hidden]
  );
  const total = visible.reduce((sum, point) => sum + point.count, 0);
  const definition = useMemo(() => {
    const rings = getDistributionRings(
      visible,
      allSummaries,
      categories,
      grouped
    );
    return defineChart({
      marks: [
        polar({
          scales: { angle: null, radius: null },
          marks: rings.map((ring) =>
            radialArc(
              pie(
                ring.slices.map((slice) => ({ ...slice, ring: ring.label })),
                { value: "count" }
              ),
              {
                id: ring.id,
                key: "name",
                fill: (slice) => slice.color,
                innerRadius: ({ radius }) => radius * ring.inner,
                outerRadius: ({ radius }) => radius * ring.outer,
                stroke: "var(--color-card)",
                strokeWidth: 1.5,
              }
            )
          ),
        }),
      ],
      scales: { x: null, y: null },
      theme: plotTheme,
      svgAnimation: plotAnimation,
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${point.datum.ring}: ${point.datum.name}. ${point.datum.count} activities (${(
            point.datum.fraction * 100
          ).toFixed(1)}%).`,
      },
    });
  }, [visible, allSummaries, categories, grouped]);
  const legend = (
    <ChartLegend
      items={points}
      hidden={hidden}
      label="Activity distribution legend"
      toggle={(name) =>
        setHidden((previous) =>
          previous.includes(name)
            ? previous.filter((item) => item !== name)
            : [...previous, name]
        )
      }
    />
  );
  return (
    <div className="space-y-3">
      <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(150px,220px)]">
        <div data-chart-surface className="min-w-0">
          {total > 0 ? (
            <Chart
              definition={definition}
              height={mobile ? 320 : 400}
              ariaLabel="Activity distribution"
              ariaDescription={`${total} visible logged activities. Outer ring: activities. ${
                grouped ? "Middle ring: categories. " : ""
              }Center: current category status.`}
            />
          ) : (
            <p
              role="status"
              className="flex h-80 items-center justify-center text-muted-foreground"
            >
              All activities are hidden. Use the legend to show one.
            </p>
          )}
        </div>
        {mobile ? (
          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Activities legend
            </summary>
            <div className="mt-2">{legend}</div>
          </details>
        ) : (
          legend
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {grouped
          ? "Outside to center: activity, category, category status."
          : "Outside to center: activity, category status."}{" "}
        Legend filtering applies only to this chart; all rings are recalculated
        together.
      </p>
    </div>
  );
}
