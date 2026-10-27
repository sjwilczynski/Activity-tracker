import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { periodsFromParams } from "@/pages/compare-utils";
import { getComparisonSeries } from "@/pages/comparison-data";
import { ComparisonChart } from "./ComparisonChart";

const records = [
  {
    id: "previous",
    name: "Custom activity",
    categoryId: "custom",
    active: true,
    date: new Date(2025, 4, 15),
  },
  {
    id: "current",
    name: "Custom activity",
    categoryId: "custom",
    active: true,
    date: new Date(2026, 9, 20),
  },
];
const series = getComparisonSeries(
  records,
  periodsFromParams("year-2026,year-2025"),
  new Date(2026, 9, 24)
);
const meta = {
  title: "Visualizations/Activity Comparison",
  component: ComparisonChart,
  args: { series },
} satisfies Meta<typeof ComparisonChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PartialYearFirst: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", { name: "Hide 2026 (partial)" })
    ).toBeVisible();
    const chart = canvas.getByRole("img", { name: "Activity comparison" });
    const partial = chart.querySelector(
      '[data-ts-key^="year-2026"].ts-chart__line'
    );
    await expect(partial?.querySelector("path")).toHaveAttribute(
      "stroke-dasharray",
      "7 4"
    );
    await expect(partial?.querySelectorAll("circle")).toHaveLength(10);
    await expect(chart).toHaveTextContent("Dec");
    await expect(chart).toHaveTextContent("0");
    await userEvent.click(canvas.getByRole("button", { name: "Hide 2025" }));
    await expect(chart).toHaveTextContent("Dec");
    await userEvent.click(
      canvas.getByRole("button", { name: "Hide 2026 (partial)" })
    );
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "All periods are hidden"
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Show 2026 (partial)" })
    );
    await expect(
      await canvas.findByRole("img", { name: "Activity comparison" })
    ).toBeVisible();
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument();
    await expect(canvas.queryByText(/^Keyboard:/)).not.toBeInTheDocument();
  },
};

export const KeyboardValues: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chart = await canvas.findByRole("img", {
      name: "Activity comparison",
    });
    chart.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(async () => {
      await expect(canvas.getByRole("status")).toHaveTextContent(
        /202[56].*entries/
      );
    });
  },
};

export const FuturePeriod: Story = {
  args: {
    series: getComparisonSeries(
      records,
      periodsFromParams("year-2027"),
      new Date(2026, 9, 24)
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "These periods have not started yet."
    );
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
