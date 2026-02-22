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

const ACTIVITY_POOL = [
  { name: "Running", categoryId: "cat-sports", active: true },
  { name: "Swimming", categoryId: "cat-sports", active: true },
  { name: "Cycling", categoryId: "cat-sports", active: true },
  { name: "Yoga", categoryId: "cat-wellness", active: true },
  { name: "Meditation", categoryId: "cat-wellness", active: true },
  { name: "Reading", categoryId: "cat-learning", active: false },
] as const;

// Seeded PRNG for deterministic mock data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Generate a full year of activities with seasonal variation per month */
function generateYearActivities(
  year: number,
  basePerMonth: number,
  idPrefix: string,
): ActivityRecordWithIdServer[] {
  // More activities in spring/summer (months 3-8), fewer in winter
  const seasonalMultiplier = [
    0.6, 0.6, 0.8, 1.0, 1.2, 1.4, 1.4, 1.2, 1.0, 0.8, 0.6, 0.5,
  ];
  const rand = seededRandom(year * 1000 + basePerMonth);
  const result: ActivityRecordWithIdServer[] = [];
  let id = 0;

  for (let month = 0; month < 12; month++) {
    const count = Math.round(basePerMonth * seasonalMultiplier[month]);
    for (let i = 0; i < count; i++) {
      const day = Math.floor(rand() * 28) + 1;
      const activity =
        ACTIVITY_POOL[Math.floor(rand() * ACTIVITY_POOL.length)];
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      result.push({
        id: `${idPrefix}-${id++}`,
        date: `${year}-${mm}-${dd}`,
        name: activity.name,
        categoryId: activity.categoryId,
        active: activity.active,
      });
    }
  }
  return result;
}

const multiYearActivities = [
  ...generateYearActivities(2024, 8, "y24"),
  ...generateYearActivities(2023, 6, "y23"),
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
