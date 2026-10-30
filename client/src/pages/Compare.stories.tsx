import type { Meta, StoryObj } from "@storybook/tanstack-react";
import MockDate from "mockdate";
import { delay, http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { multiYearActivities } from "../mocks/data/comparison";
import { darkPreferencesHandler } from "../mocks/handlers";
import { Compare } from "./Compare";

const meta: Meta<typeof Compare> = {
  title: "Pages/Compare",
  component: Compare,
  parameters: { tanstack: { router: { path: "/compare" } } },
  beforeEach: () => {
    const previous = new Date();
    MockDate.set(new Date(2025, 1, 12));
    return () => MockDate.set(previous);
  },
};

export default meta;
type Story = StoryObj<typeof Compare>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole("heading", { name: /compare periods/i })
    ).toBeInTheDocument();
    await expect(canvas.getByText("No periods selected")).toBeInTheDocument();
  },
};

export const AddPeriodInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Select February month", async () => {
      const monthTrigger = canvas.getByRole("combobox", { name: /month/i });
      await userEvent.click(monthTrigger);
      const februaryOption = await screen.findByRole("option", {
        name: "February",
      });
      await userEvent.click(februaryOption);
    });

    await step("Select year 2024", async () => {
      const yearTrigger = await canvas.findByRole("combobox", {
        name: /year/i,
      });
      await userEvent.click(yearTrigger);
      const yearOption = await screen.findByRole("option", { name: "2024" });
      await userEvent.click(yearOption);
    });

    await step("Add the period", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: /add period/i })
      );
    });

    await step("Verify period badge and charts appear", async () => {
      await waitFor(async () => {
        // "February 2024" appears in both badge and metric card
        const matches = canvas.getAllByText("February 2024");
        await expect(matches.length).toBeGreaterThanOrEqual(1);
      });

      await expect(canvas.getByText("Activity Comparison")).toBeInTheDocument();
      await expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    });
  },
};

export const CompareYears: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", async () => {
          await delay(50);
          return HttpResponse.json(multiYearActivities);
        }),
      ],
    },
    tanstack: {
      router: {
        query: {
          periods: "year-2024,year-2023,year-2022,year-2021,year-2020",
        },
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Verify chart is rendered", async () => {
      await expect(canvas.getByText("Activity Comparison")).toBeInTheDocument();
      await expect(
        canvas.getByText("Monthly activity counts")
      ).toBeInTheDocument();
    });

    await step("Verify both period badges", async () => {
      await expect(canvas.getAllByText("2024").length).toBeGreaterThanOrEqual(
        1
      );
      await expect(canvas.getAllByText("2023").length).toBeGreaterThanOrEqual(
        1
      );
      await expect(canvas.getAllByText("2022").length).toBeGreaterThanOrEqual(
        1
      );
      await expect(canvas.getAllByText("2021").length).toBeGreaterThanOrEqual(
        1
      );
      await expect(canvas.getAllByText("2020").length).toBeGreaterThanOrEqual(
        1
      );
    });

    await step("Scroll to metric cards and verify", async () => {
      const metricCards = canvas.getAllByText("Total Activities");
      await expect(metricCards.length).toBe(5);

      const popularLabels = canvas.getAllByText("Most Popular");
      await expect(popularLabels.length).toBe(5);

      const mostActiveLabels = canvas.getAllByText("Most Active Month");
      await expect(mostActiveLabels.length).toBe(5);
    });

    await step(
      "Show completed historical years, not a partial current year",
      async () => {
        await expect(
          canvas.getByRole("button", { name: "Hide 2024" })
        ).toBeVisible();
        await expect(
          canvas.getAllByText("Total Activities")[0].parentElement
        ).toHaveTextContent("72");
      }
    );
  },
};

export const DarkMode: Story = {
  parameters: {
    msw: {
      handlers: [
        darkPreferencesHandler,
        http.get("*/api/activities", async () => {
          await delay(50);
          return HttpResponse.json(multiYearActivities);
        }),
      ],
    },
    tanstack: { router: { query: { periods: "year-2024,year-2023" } } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await expect(canvas.getByText("Activity Comparison")).toBeInTheDocument();
    await expect(canvas.getAllByText("Total Activities").length).toBe(2);
    await expect(
      canvas.getAllByText("Total Activities")[0].parentElement
    ).toHaveTextContent("72");
    await expect(
      canvas.getByRole("button", { name: "Hide 2024" })
    ).toBeVisible();
  },
};

export const PartialYear: Story = {
  beforeEach: () => {
    const previous = new Date();
    MockDate.set(new Date(2024, 5, 15));
    return () => MockDate.set(previous);
  },
  parameters: {
    ...CompareYears.parameters,
    tanstack: { router: { query: { periods: "year-2024,year-2023" } } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", { name: "Hide 2024 (partial)" })
    ).toBeVisible();
    const chart = canvas.getByRole("img", { name: "Activity comparison" });
    await expect(chart).toBeVisible();
    await expect(
      canvas.getAllByText("Total Activities")[0].parentElement
    ).toHaveTextContent(
      String(
        multiYearActivities.filter(
          (record) =>
            record.active &&
            record.date >= "2024-01-01" &&
            record.date <= "2024-06-15"
        ).length
      )
    );
    await expect(chart).toHaveTextContent("Dec");
  },
};
