import { barY } from "@tanstack/charts/bar";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { defineChart } from "@tanstack/charts/scene";
import { tooltip } from "@tanstack/charts/tooltip";
import { useMemo } from "react";
import { useFunAnimations } from "@/components/styles/StylesProvider";
import type { ActivityPoint } from "./activity-chart-data";
import {
  chartAnimation,
  chartTheme,
  entryCount,
  formatCount,
} from "./chart-theme";

export function BarChart({
  points,
  grouped,
}: {
  points: ActivityPoint[];
  grouped: boolean;
}) {
  const [animate] = useFunAnimations();
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          barY(points, {
            x: (point) => (grouped ? point.category : point.name),
            y: "count",
            y1: grouped ? undefined : 0,
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
              ticks: { format: formatCount },
            },
          },
        },
        theme: chartTheme,
        svgAnimation: animate ? chartAnimation : false,
        tooltip: {
          use: tooltip,
          format: (point) =>
            `${point.datum.name}: ${entryCount(point.datum.count)} (${point.datum.category}${
              point.datum.active ? "" : ", inactive category"
            })`,
        },
      }),
    [points, grouped, animate]
  );
  return (
    <div className="activity-charts space-y-3">
      <div data-chart-surface>
        <Chart
          definition={definition}
          height={400}
          ariaLabel="Activity frequency"
          ariaDescription={`${points.reduce((sum, point) => sum + point.count, 0)} logged entries. ${
            grouped
              ? "Bars are stacked by activity within each category."
              : "One bar per activity."
          } Use arrow keys to explore individual values.`}
        />
      </div>
    </div>
  );
}
