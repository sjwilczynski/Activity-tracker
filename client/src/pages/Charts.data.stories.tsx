import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Charts } from "./Charts";

const meta = {
  title: "Pages/Charts/Account data",
  component: Charts,
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
    const stats = canvas
      .getByText("Total Activities")
      .closest('[data-slot="card"]');
    await expect(stats).toHaveTextContent("Total Activities1");
    await expect(
      canvas.queryByText("No activities in this selection")
    ).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText("Scenario")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("option", { name: /^2024$/ })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("img", { name: "Activity frequency" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("img", { name: "Activity distribution" })
    ).toBeVisible();
  },
} satisfies Meta<typeof Charts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomActivityNames: Story = {};

export const InactiveOnly: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () =>
          HttpResponse.json([
            {
              id: "inactive",
              name: "Archived activity",
              date: "2024-01-15",
              categoryId: "archive",
              active: false,
            },
          ])
        ),
        http.get("*/api/categories", () =>
          HttpResponse.json([
            {
              id: "archive",
              name: "Archive",
              description: "",
              active: false,
              activityNames: ["Archived activity"],
            },
          ])
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("img", { name: "Activity distribution" })
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /^Hide inactive$/ })
    );
    await expect(await canvas.findByText("No activities found")).toBeVisible();
    const stats = canvas
      .getByText("Total Activities")
      .closest('[data-slot="card"]');
    await expect(stats).toHaveTextContent("Total Activities0");
    await expect(
      canvas.queryByRole("img", { name: "Activity distribution" })
    ).not.toBeInTheDocument();
  },
};

export const FlatGrouping: Story = {
  parameters: {
    msw: {
      handlers: [
        ...meta.parameters.msw.handlers,
        http.get("*/api/preferences", () =>
          HttpResponse.json({
            groupByCategory: false,
            funAnimations: false,
            isLightTheme: true,
          })
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("img", { name: "Activity distribution" });
    await waitFor(async () => {
      await expect(
        canvasElement.querySelectorAll(".ts-chart__arc")
      ).toHaveLength(2);
    });
    await userEvent.click(canvas.getByText(/View exact activity data/));
    const table = canvas.getByRole("table", {
      name: "Activity counts in the selected date range",
    });
    await expect(
      within(table).getByRole("rowheader", { name: "A custom activity" })
    ).toBeVisible();
  },
};

export const ToggleGrouping: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("img", { name: "Activity distribution" });
    const toggle = canvas.getByRole("button", { name: "Group by category" });
    await waitFor(async () => {
      await expect(toggle).toBeEnabled();
    });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await waitFor(async () => {
      await expect(
        canvasElement.querySelectorAll(".ts-chart__arc")
      ).toHaveLength(2);
    });
  },
};

export const GroupingSaveFailure: Story = {
  parameters: {
    msw: {
      handlers: [
        ...meta.parameters.msw.handlers,
        http.put(
          "*/api/preferences",
          () => new HttpResponse(null, { status: 500 })
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("img", { name: "Activity distribution" });
    const toggle = canvas.getByRole("button", { name: "Group by category" });
    await waitFor(async () => {
      await expect(toggle).toBeEnabled();
    });
    await userEvent.click(toggle);
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Chart grouping could not be saved"
    );
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};
