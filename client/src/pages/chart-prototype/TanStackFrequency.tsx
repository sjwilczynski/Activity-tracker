import { barX, barY } from "@tanstack/charts/bar";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { defineChart } from "@tanstack/charts/scene";
import { text } from "@tanstack/charts/text";
import { tooltip } from "@tanstack/charts/tooltip";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ActivityPoint } from "./chart-model";
import { plotAnimation, plotTheme } from "./PlotFrame";

export function TanStackFrequency({
  points,
  grouped,
}: {
  points: ActivityPoint[];
  grouped: boolean;
}) {
  const definition = useMemo(() => {
    const ordered = grouped
      ? points
      : [...points].sort(
          (a, b) => b.count - a.count || a.name.localeCompare(b.name)
        );
    return defineChart({
      marks: [
        barY(ordered, {
          x: (point) => (grouped ? point.category : point.name),
          y: "count",
          z: "name",
          key: "name",
          fill: (point) => point.color,
          radius: { end: 6 },
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand<string>().padding(0.2),
          grid: false,
          axis: { tickLabels: { fontSize: 12 } },
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: false,
          axis: {
            tickLabels: { fontSize: 12 },
            ticks: {
              format: (value) =>
                Number.isInteger(Number(value)) ? String(value) : "",
            },
          },
        },
      },
      theme: plotTheme,
      svgAnimation: plotAnimation,
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${point.datum.name}: ${point.datum.count} activities (${point.datum.category}${
            point.datum.active ? "" : ", inactive category"
          })`,
      },
    });
  }, [points, grouped]);
  return (
    <div data-chart-surface>
      <Chart
        definition={definition}
        height={400}
        ariaLabel="Activity frequency"
        ariaDescription={`${points.reduce((sum, point) => sum + point.count, 0)} logged activities. ${
          grouped
            ? "Bars are stacked by activity within each category."
            : "One bar per activity."
        } Use arrow keys to explore individual values.`}
      />
    </div>
  );
}

export function RankedActivityPlot({ points }: { points: ActivityPoint[] }) {
  const mobile = useIsMobile();
  const ranked = useMemo(
    () =>
      [...points].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name)
      ),
    [points]
  );
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          barX(ranked, {
            x: "count",
            y: "name",
            key: "name",
            fill: (point) => point.color,
            radius: 4,
          }),
          text(ranked, {
            x: "count",
            y: "name",
            key: "name",
            text: (point) => String(point.count),
            anchor: "start",
            dx: 8,
            fontWeight: 600,
            fill: "var(--color-foreground)",
          }),
        ],
        scales: {
          x: {
            scale: scaleLinear().domain([
              0,
              Math.max(...ranked.map((point) => point.count)) * 1.17,
            ]),
            grid: true,
            axis: {
              label: "Logged activities",
              tickLabels: { fontSize: 12 },
              ticks: {
                count: 5,
                format: (value) =>
                  Number.isInteger(Number(value)) ? String(value) : "",
              },
            },
          },
          y: {
            scale: scaleBand<string>()
              .domain(ranked.map((point) => point.name))
              .padding(0.3),
            grid: false,
            axis: {
              tickLabels: { fontSize: 12 },
              ticks: {
                format: (value) => {
                  const label = String(value);
                  const limit = mobile ? 18 : 34;
                  return label.length > limit
                    ? `${label.slice(0, limit - 3)}...`
                    : label;
                },
              },
            },
          },
        },
        theme: plotTheme,
        svgAnimation: plotAnimation,
        tooltip: {
          use: tooltip,
          format: (point) => {
            const total = points.reduce((sum, item) => sum + item.count, 0);
            return `${point.datum.name}: ${point.datum.count} (${((point.datum.count / total) * 100).toFixed(1)}%). ${
              point.datum.category
            }${point.datum.active ? "" : "; inactive category"}`;
          },
        },
      }),
    [ranked, points, mobile]
  );
  return (
    <div data-chart-surface>
      <Chart
        definition={definition}
        height={Math.max(280, ranked.length * 42 + 65)}
        ariaLabel="Activities ranked by frequency"
        ariaDescription="Largest count first. Values are printed beside the bars. Full names and category status are available in the exact data table."
      />
    </div>
  );
}
