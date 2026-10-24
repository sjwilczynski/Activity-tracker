import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, fn, within } from "storybook/test";
import { PrototypeComparison } from "./PrototypeComparison";

const meta = {
  title: "Prototypes/Partial comparison periods",
  component: PrototypeComparison,
  args: {
    variant: "parity",
    sampleData: true,
    mode: "years",
    onChange: fn(),
    records: [
      {
        id: "previous",
        name: "A custom activity",
        categoryId: "custom",
        active: true,
        date: new Date(2025, 4, 15),
      },
      {
        id: "current",
        name: "A custom activity",
        categoryId: "custom",
        active: true,
        date: new Date(2026, 9, 20),
      },
    ],
  },
} satisfies Meta<typeof PrototypeComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PartialYearInParity: Story = {
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
    await expect(chart).toHaveTextContent("2026 (partial)");
  },
};
