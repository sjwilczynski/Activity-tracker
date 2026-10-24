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
import { Line } from "react-chartjs-2";
import { useIsLightTheme } from "@/components/styles/StylesProvider";
import { useChartColors } from "@/utils/useChartColors";
import { accessiblePlotColors } from "./chart-colors";
import type { ComparisonSeries } from "./chart-model";
import { ChartLegend, plotAnimation, plotTheme } from "./PlotFrame";

const dashes = ["", "7 4", "2 4", "10 3 2 3", "12 4", "2 3 2 6", "8 3 2 3 2 3"];

export function BaselineComparison({ series }: { series: ComparisonSeries[] }) {
  const colors = useChartColors();
  return (
    <div className="h-[340px]">
      <Line
        aria-label="Activity comparison"
        data={{
          labels: series[0]?.points.map((point) => point.bucket) ?? [],
          datasets: series.map((entry) => ({
            label: entry.name,
            data: entry.points.map((point) => point.count),
            borderColor: entry.color,
            backgroundColor: `${entry.color}33`,
            tension: 0.3,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: colors.foreground,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
          },
          scales: {
            x: {
              ticks: { color: colors.mutedForeground },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: { color: colors.mutedForeground },
              grid: { display: false },
            },
          },
        }}
      />
    </div>
  );
}

export function TanStackComparison({
  series: inputSeries,
  clarity = false,
}: {
  series: ComparisonSeries[];
  clarity?: boolean;
}) {
  const light = useIsLightTheme();
  const series = useMemo(
    () =>
      clarity
        ? inputSeries.map((entry, index) => ({
            ...entry,
            color: accessiblePlotColors(light)[index % 7],
          }))
        : inputSeries,
    [inputSeries, clarity, light]
  );
  const [hidden, setHidden] = useState<string[]>([]);
  const definition = useMemo(() => {
    const visible = series.filter((entry) => !hidden.includes(entry.name));
    return defineChart({
      marks: visible.flatMap((entry, index) => {
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
          strokeWidth: clarity ? 2.5 : 2,
          strokeDasharray: clarity
            ? dashes[series.indexOf(entry) % dashes.length]
            : undefined,
        });
        return clarity && series.length <= 3 && points.length
          ? [
              line,
              text(points.slice(-1), {
                id: `label-${index}`,
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
            .domain(series[0]?.points.map((point) => point.bucket) ?? [])
            .padding(clarity ? 0.7 : 0.2),
          grid: false,
          axis: { tickLabels: { fontSize: 12 } },
        },
        y: {
          scale: scaleLinear().domain([
            0,
            Math.max(
              1,
              ...series.flatMap((entry) =>
                entry.points.map((point) => point.count)
              )
            ),
          ]),
          nice: true,
          grid: clarity,
          axis: {
            tickLabels: { fontSize: 12 },
            ticks: {
              format: (value) =>
                Number.isInteger(Number(value)) ? String(value) : "",
            },
          },
        },
      },
      margin: clarity ? { right: 70 } : undefined,
      theme: plotTheme,
      svgAnimation: plotAnimation,
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${point.datum.period}, ${point.datum.bucket}: ${point.datum.count} activities`,
      },
    });
  }, [series, hidden, clarity]);
  return (
    <div className="space-y-3">
      <ChartLegend
        items={series.map((entry, index) => ({
          name: entry.name,
          color: entry.color,
          dash: clarity ? dashes[index % dashes.length] : "",
        }))}
        hidden={hidden}
        label="Comparison periods"
        toggle={(name) =>
          setHidden((previous) =>
            previous.includes(name)
              ? previous.filter((item) => item !== name)
              : [...previous, name]
          )
        }
      />
      {series.some((entry) => !hidden.includes(entry.name)) ? (
        <div data-chart-surface>
          <Chart
            definition={definition}
            height={340}
            ariaLabel="Activity comparison"
            ariaDescription={`${series.map((entry) => entry.name).join(" compared with ")}. ${
              clarity
                ? "Line patterns and labels distinguish periods without relying on color. "
                : ""
            }Only activities in currently active categories are counted.`}
          />
        </div>
      ) : (
        <p
          role="status"
          className="flex h-[340px] items-center justify-center text-muted-foreground"
        >
          All periods are hidden. Use a legend button to show one.
        </p>
      )}
    </div>
  );
}
