import { barY } from "@tanstack/charts/bar";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { createChartScene, defineChart } from "@tanstack/charts/scene";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { ActivityPoint } from "./activity-chart-data";
import { BarChart } from "./BarChart";

vi.mock("@tanstack/charts/bar", async (importOriginal) => {
  const actual = await importOriginal<{ barY: typeof barY }>();
  return { ...actual, barY: vi.fn(actual.barY) };
});
vi.mock("@tanstack/charts/react", () => ({ Chart: () => null }));
vi.mock("@/components/styles/StylesProvider", () => ({
  useFunAnimations: () => [false, vi.fn()],
}));

beforeEach(() => vi.clearAllMocks());

function renderBarScene(points: ActivityPoint[], grouped: boolean) {
  renderToStaticMarkup(<BarChart points={points} grouped={grouped} />);
  const mark = vi.mocked(barY).mock.results[0].value;
  return createChartScene(
    defineChart({
      marks: [mark],
      scales: {
        x: { scale: () => scaleBand<string>().padding(0.2) },
        y: { scale: scaleLinear },
      },
    }),
    { width: 1000, height: 400 }
  );
}

it("bypasses implicit stacking for a large set of distinct flat activity bars", () => {
  const points = Array.from({ length: 1000 }, (_, index) => ({
    name: `Activity ${index}`,
    category: "Sports",
    count: index + 1,
    active: true,
    color: "#2364a0",
  }));
  renderToStaticMarkup(<BarChart points={points} grouped={false} />);
  // An explicit interval prevents the chart library allocating a position-by-series matrix.
  expect(vi.mocked(barY).mock.calls[0][1]?.y1).toBe(0);
  vi.clearAllMocks();
  const scene = renderBarScene(points, false);
  expect(scene.points).toHaveLength(1000);
  expect(scene.points.every((point) => point.y1Value === 0)).toBe(true);
  expect(scene.points.map((point) => point.y2Value)).toEqual(
    points.map((point) => point.count)
  );
});

it("retains implicit stacking within each category in grouped mode", () => {
  const points = [
    {
      name: "Run",
      category: "Sports",
      count: 6,
      active: true,
      color: "#2364a0",
    },
    {
      name: "Cycle",
      category: "Sports",
      count: 4,
      active: true,
      color: "#087447",
    },
  ];
  const scene = renderBarScene(points, true);
  expect(vi.mocked(barY).mock.calls[0][1]?.y1).toBeUndefined();
  expect(scene.points.map((point) => [point.y1Value, point.y2Value])).toEqual([
    [0, 6],
    [6, 10],
  ]);
});
