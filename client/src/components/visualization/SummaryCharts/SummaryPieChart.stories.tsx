import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, within } from "storybook/test";
import { SummaryPieChart } from "./SummaryPieChart";

const points = Array.from({ length: 30 }, (_, index) => ({
  name: `Activity ${String(index + 1).padStart(2, "0")}`,
  category: `Category ${index + 1}`,
  count: index + 1,
  active: true,
  color: "#2364a0",
}));

const meta = {
  title: "Visualizations/Activity Distribution",
  component: SummaryPieChart,
  args: {
    points,
    allSummaries: Object.fromEntries(
      points.map((point) => [
        point.name,
        { count: point.count, active: point.active },
      ])
    ),
    categories: points.map((point, index) => ({
      name: point.name,
      categoryName: point.category,
      categoryId: String(index),
      active: true,
    })),
    grouped: true,
  },
  render: (args) => (
    <div className="max-w-6xl">
      <SummaryPieChart {...args} />
    </div>
  ),
} satisfies Meta<typeof SummaryPieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThirtyActivities: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = await canvas.findByRole("group", {
      name: "Activity distribution legend",
    });
    const buttons = within(legend).getAllByRole("button");
    await expect(buttons).toHaveLength(30);
    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    await expect(
      canvas.getByRole("img", { name: "Activity distribution" })
    ).toBeVisible();
  },
};

export const LongNames: Story = {
  args: {
    points: points.map((point) => ({
      ...point,
      name: `${point.name}: a much longer activity description`,
    })),
  },
  play: async ({ canvasElement }) => {
    const legend = await within(canvasElement).findByRole("group", {
      name: "Activity distribution legend",
    });
    const buttons = within(legend).getAllByRole("button");
    buttons.at(-1)!.focus();
    await expect(buttons.at(-1)).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(buttons.at(-1)).toHaveAttribute("aria-pressed", "false");
  },
};

export const HideAllAndRestore: Story = {
  args: { points: points.slice(0, 3) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = await canvas.findByRole("group", {
      name: "Activity distribution legend",
    });
    for (const button of within(legend).getAllByRole("button"))
      await userEvent.click(button);
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "All activities are hidden"
    );
    await userEvent.click(
      within(legend).getByRole("button", { name: "Show Activity 01" })
    );
    await expect(
      await canvas.findByRole("img", { name: "Activity distribution" })
    ).toBeVisible();
    await expect(
      within(legend).getByRole("button", { name: "Hide Activity 01" })
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const MobileLongName: Story = {
  globals: { viewport: { value: "mobile2" } },
  args: { points: [{ ...points[0], name: "W".repeat(50) }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expandLegend = canvas.queryByText("Activities legend");
    if (expandLegend) await userEvent.click(expandLegend);
    const button = await canvas.findByRole("button", {
      name: `Hide ${"W".repeat(50)}`,
    });
    await userEvent.click(button);
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "All activities are hidden"
    );
    await userEvent.click(
      canvas.getByRole("button", { name: `Show ${"W".repeat(50)}` })
    );
    await expect(
      await canvas.findByRole("img", { name: "Activity distribution" })
    ).toBeVisible();
  },
};
