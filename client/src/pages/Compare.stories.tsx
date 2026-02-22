import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http, HttpResponse } from "msw";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import type { ActivityRecordWithIdServer } from "../data/types";
import { Compare } from "./Compare";

const meta: Meta<typeof Compare> = {
  title: "Pages/Compare",
  component: Compare,
};

export default meta;
type Story = StoryObj<typeof Compare>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(
      canvas.getByRole("heading", { name: /compare periods/i })
    ).toBeInTheDocument();
    expect(canvas.getByText("No periods selected")).toBeInTheDocument();
  },
};

export const AddPeriodInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
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
      const yearTrigger = canvas.getByRole("combobox", { name: /year/i });
      await userEvent.click(yearTrigger);
      const yearOption = await screen.findByRole("option", { name: "2024" });
      await userEvent.click(yearOption);
    });

    await step("Add the period", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /add period/i })
      );
    });

    await step("Verify period badge and charts appear", async () => {
      await waitFor(() => {
        // "February 2024" appears in both badge and metric card
        const matches = canvas.getAllByText("February 2024");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });

      expect(canvas.getByText("Activity Comparison")).toBeInTheDocument();
      expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    });
  },
};

// Activities spanning 2023 and 2024 for year comparison
const multiYearActivities: ActivityRecordWithIdServer[] = [
  // 2024 — Jan & Feb, mix of activities
  { id: "y1", date: "2024-01-05", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y2", date: "2024-01-12", name: "Swimming", categoryId: "cat-sports", active: true },
  { id: "y3", date: "2024-01-20", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y4", date: "2024-02-03", name: "Cycling", categoryId: "cat-sports", active: true },
  { id: "y5", date: "2024-02-08", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y6", date: "2024-02-14", name: "Yoga", categoryId: "cat-wellness", active: true },
  { id: "y7", date: "2024-02-20", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y8", date: "2024-03-01", name: "Meditation", categoryId: "cat-wellness", active: true },
  { id: "y9", date: "2024-03-15", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y10", date: "2024-04-10", name: "Cycling", categoryId: "cat-sports", active: true },
  { id: "y11", date: "2024-05-22", name: "Swimming", categoryId: "cat-sports", active: true },
  { id: "y12", date: "2024-06-18", name: "Running", categoryId: "cat-sports", active: true },
  // 2023 — spread across the year
  { id: "y13", date: "2023-01-10", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y14", date: "2023-02-14", name: "Swimming", categoryId: "cat-sports", active: true },
  { id: "y15", date: "2023-03-05", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y16", date: "2023-03-20", name: "Cycling", categoryId: "cat-sports", active: true },
  { id: "y17", date: "2023-04-12", name: "Yoga", categoryId: "cat-wellness", active: true },
  { id: "y18", date: "2023-05-08", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y19", date: "2023-05-25", name: "Meditation", categoryId: "cat-wellness", active: true },
  { id: "y20", date: "2023-06-15", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y21", date: "2023-07-01", name: "Swimming", categoryId: "cat-sports", active: true },
  { id: "y22", date: "2023-08-18", name: "Cycling", categoryId: "cat-sports", active: true },
  { id: "y23", date: "2023-09-03", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y24", date: "2023-10-20", name: "Yoga", categoryId: "cat-wellness", active: true },
  { id: "y25", date: "2023-11-11", name: "Running", categoryId: "cat-sports", active: true },
  { id: "y26", date: "2023-12-25", name: "Meditation", categoryId: "cat-wellness", active: true },
];

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
    reactRouter: reactRouterParameters({
      location: {
        searchParams: { periods: "year-2024,year-2023" },
      },
    }),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Verify chart is rendered", async () => {
      expect(canvas.getByText("Activity Comparison")).toBeInTheDocument();
      expect(canvas.getByText("Monthly activity counts")).toBeInTheDocument();
    });

    await step("Verify both period badges", async () => {
      expect(canvas.getAllByText("2024").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("2023").length).toBeGreaterThanOrEqual(1);
    });

    await step("Scroll to metric cards and verify", async () => {
      const metricCards = canvas.getAllByText("Total Activities");
      expect(metricCards.length).toBe(2);

      const popularLabels = canvas.getAllByText("Most Popular");
      expect(popularLabels.length).toBe(2);

      const mostActiveLabels = canvas.getAllByText("Most Active Month");
      expect(mostActiveLabels.length).toBe(2);
    });
  },
};
