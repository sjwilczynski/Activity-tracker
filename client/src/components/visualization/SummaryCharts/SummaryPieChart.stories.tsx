import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
    await expect(
      legend.parentElement!.getBoundingClientRect().height
    ).toBeLessThanOrEqual(410);
    const columns = new Set(
      buttons.map((button) => Math.round(button.getBoundingClientRect().left))
    );
    await expect(columns.size).toBeGreaterThanOrEqual(2);
    await expect(legend.scrollHeight).toBeLessThanOrEqual(
      legend.clientHeight + 1
    );
    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    await waitFor(async () => {
      await expect(
        canvasElement.querySelectorAll('[data-ts-key="activities"] path')
      ).toHaveLength(29);
    });
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
    await expect(
      legend.parentElement!.getBoundingClientRect().height
    ).toBeLessThanOrEqual(410);
    buttons.at(-1)!.focus();
    const bottom = buttons.at(-1)!.getBoundingClientRect().bottom;
    await expect(bottom).toBeLessThanOrEqual(
      legend.getBoundingClientRect().bottom + 1
    );
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
    await waitFor(async () => {
      await expect(
        canvasElement.querySelectorAll('[data-ts-key="activities"] path')
      ).toHaveLength(1);
    });
  },
};
