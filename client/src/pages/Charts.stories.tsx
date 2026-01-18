import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { http, HttpResponse, delay } from "msw";
import { Charts } from "./Charts";

const meta: Meta<typeof Charts> = {
  title: "Pages/Charts",
  component: Charts,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Charts>;

// Generate dates for mock data
const generateDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

// Default story - normal state with chart data
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for data to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify date filter is visible", async () => {
      expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(canvas.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    await step("Verify charts are rendered", async () => {
      // Charts are rendered inside canvas elements
      const canvasElements = canvasElement.querySelectorAll("canvas");
      expect(canvasElements.length).toBe(3); // BarChart, PieChart, SummaryBarChart
    });
  },
};

// Loading state
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", async () => {
          await delay("infinite");
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toBeInTheDocument();
  },
};

// Error state
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for error to display", async () => {
      await waitFor(
        () => {
          expect(
            canvas.getByText(/an error has occurred/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify back to homepage button exists", async () => {
      expect(
        canvas.getByRole("button", { name: /back to homepage/i })
      ).toBeInTheDocument();
    });
  },
};

// Empty state - no activities
export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [http.get("*/api/activities", () => HttpResponse.json([]))],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for page to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify empty state message", async () => {
      expect(canvas.getByText(/no activities/i)).toBeInTheDocument();
    });
  },
};

// Date filter interaction
export const DateFilterInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for page to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify date filter form is present", async () => {
      expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(canvas.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    await step("Click submit button to apply filter", async () => {
      const submitButton = canvas.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);
    });

    await step("Verify charts still render after filter", async () => {
      const canvasElements = canvasElement.querySelectorAll("canvas");
      expect(canvasElements.length).toBe(3);
    });
  },
};

// Single activity type
export const SingleActivityType: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          return HttpResponse.json([
            { id: "1", date: generateDate(0), name: "Running", active: true },
            { id: "2", date: generateDate(1), name: "Running", active: true },
            { id: "3", date: generateDate(2), name: "Running", active: true },
            { id: "4", date: generateDate(3), name: "Running", active: true },
            { id: "5", date: generateDate(4), name: "Running", active: true },
          ]);
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for data to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify charts render with single activity type", async () => {
      const canvasElements = canvasElement.querySelectorAll("canvas");
      expect(canvasElements.length).toBe(3);
    });
  },
};

// Many activity types
export const ManyActivityTypes: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          const activities = [
            "Running",
            "Swimming",
            "Cycling",
            "Yoga",
            "Meditation",
            "Reading",
            "Walking",
            "Hiking",
            "Dancing",
            "Gym",
            "Basketball",
            "Soccer",
          ].flatMap((name, idx) =>
            Array.from({ length: 3 }, (_, i) => ({
              id: `${idx * 3 + i + 1}`,
              date: generateDate(i),
              name,
              active: idx % 2 === 0,
            }))
          );
          return HttpResponse.json(activities);
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for data to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify charts render with many activity types", async () => {
      const canvasElements = canvasElement.querySelectorAll("canvas");
      expect(canvasElements.length).toBe(3);
    });
  },
};
