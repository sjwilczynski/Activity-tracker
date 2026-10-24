import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { http, HttpResponse } from "msw";
import { expect, within } from "storybook/test";
import ChartPrototype from "./ChartPrototype";

const meta = {
  title: "Prototypes/Charts with real activity names",
  component: ChartPrototype,
  args: { variant: "parity" },
  parameters: {
    tanstack: { router: { path: "/charts" } },
    msw: {
      handlers: [
        http.get("*/api/activities", () =>
          HttpResponse.json([
            {
              id: "custom-record",
              name: "A custom activity",
              date: "2024-05-15",
              categoryId: "custom-category",
              active: true,
            },
          ])
        ),
        http.get("*/api/categories", () =>
          HttpResponse.json([
            {
              id: "custom-category",
              name: "My category",
              description: "",
              activityNames: ["A custom activity"],
              active: true,
            },
          ])
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Activity Analytics")).toBeVisible();
    await expect(
      canvas.getByText("Total Activities").parentElement
    ).toHaveTextContent("Total Activities1");
    await expect(
      canvas.queryByText("No activities in this selection")
    ).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText("Scenario")).not.toBeInTheDocument();
    await expect(
      canvas.getByText(/Using your signed-in account's activities/)
    ).toBeVisible();
    await expect(
      canvas.getByRole("option", { name: /^2024$/ })
    ).toBeInTheDocument();
  },
} satisfies Meta<typeof ChartPrototype>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParityWithCustomActivity: Story = {};
export const ClarityWithCustomActivity: Story = {
  args: { variant: "clarity" },
};
export const BaselineWithCustomActivity: Story = {
  args: { variant: "baseline" },
};
