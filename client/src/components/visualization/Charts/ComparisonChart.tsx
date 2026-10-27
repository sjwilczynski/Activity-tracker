import { d3Curve } from "@tanstack/charts/d3/shape";
import { lineY } from "@tanstack/charts/line";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { defineChart } from "@tanstack/charts/scene";
import { text } from "@tanstack/charts/text";
import { tooltip } from "@tanstack/charts/tooltip";
import { curveMonotoneX } from "d3-shape";
import { useMemo, useState } from "react";
import { useFunAnimations } from "@/components/styles/StylesProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getComparisonBuckets,
  type ComparisonSeries,
} from "@/pages/comparison-data";
import {
  chartAnimation,
  chartTheme,
  entryCount,
  formatCount,
} from "./chart-theme";
import { ChartLegend, KeyboardHint, toggleHidden } from "./ChartLegend";
import { ComparisonDataTable } from "./ComparisonDataTable";

export function ComparisonChart({ series }: { series: ComparisonSeries[] }) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [animate] = useFunAnimations();
  const mobile = useIsMobile();
  const definition = useMemo(() => {
    const labelEnds =
      !mobile && series.length <= 3 && series.some((entry) => entry.partial);
    const visible = series.filter((entry) => !hidden.includes(entry.id));
    const maximum = series.reduce(
      (max, entry) =>
        entry.points.reduce(
          (value, point) => Math.max(value, point.count),
          max
        ),
      1
    );
    return defineChart({
      marks: visible.flatMap((entry) => {
        const points = entry.points.map((point) => ({
          ...point,
          period: entry.name,
        }));
        const line = lineY(points, {
          id: entry.id,
          x: "bucket",
          y: "count",
          key: "bucket",
          z: "period",
          stroke: entry.color,
          points: true,
          curve: d3Curve(curveMonotoneX),
          strokeWidth: 2,
          strokeDasharray: entry.partial ? "7 4" : undefined,
        });
        return labelEnds && entry.partial && points.length
          ? [
              line,
              text(points.slice(-1), {
                id: `label-${entry.id}`,
                x: "bucket",
                y: "count",
                text: "period",
                dx: 8,
                anchor: "start",
                fontSize: 11,
                fill: "var(--color-foreground)",
              }),
            ]
          : [line];
      }),
      scales: {
        x: {
          scale: scalePoint<string>()
            .domain(getComparisonBuckets(series))
            .padding(labelEnds ? 0.7 : 0.2),
          grid: false,
          axis: { tickLabels: { fontSize: 12 } },
        },
        y: {
          scale: scaleLinear().domain([0, maximum]),
          nice: true,
          grid: false,
          axis: {
            tickLabels: { fontSize: 12 },
            ticks: { format: formatCount },
          },
        },
      },
      margin: labelEnds ? { right: 100 } : undefined,
      theme: chartTheme,
      svgAnimation: animate ? chartAnimation : false,
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${point.datum.period}, ${point.datum.bucket}: ${entryCount(point.datum.count)}`,
      },
    });
  }, [series, hidden, animate, mobile]);
  const visible = series.filter((entry) => !hidden.includes(entry.id));
  return (
    <div className="activity-charts space-y-3">
      <ChartLegend
        items={series.map((entry) => ({
          id: entry.id,
          name: entry.name,
          color: entry.color,
          dash: entry.partial ? "7 4" : "",
        }))}
        hidden={hidden}
        label="Comparison periods"
        toggle={(id) => setHidden((previous) => toggleHidden(previous, id))}
      />
      {visible.some((entry) => entry.points.length) ? (
        <div data-chart-surface>
          <Chart
            definition={definition}
            height={340}
            ariaLabel="Activity comparison"
            ariaDescription={`${visible.map((entry) => entry.name).join(" compared with ")}. Only entries in currently active categories are counted. Dashed lines indicate partial periods. Exact values are in the comparison data table below.`}
          />
        </div>
      ) : (
        <p
          role="status"
          className="flex h-[340px] items-center justify-center text-muted-foreground"
        >
          {visible.length
            ? "These periods have not started yet."
            : "All periods are hidden. Use a legend button to show one."}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Dashed lines indicate partial periods. Future buckets are omitted, not
        plotted as zero.
      </p>
      <KeyboardHint />
      <ComparisonDataTable series={series} />
    </div>
  );
}
